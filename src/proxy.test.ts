// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserType } from "@/types/User";

const fetchMock = vi.fn();

async function loadProxy(apiUrl = "") {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", apiUrl);
  vi.stubGlobal("fetch", fetchMock);
  return (await import("./proxy")).proxy;
}

function request(path: string, cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest(`http://localhost${path}`, { headers: cookie ? { cookie } : {} });
}

const external = { accessToken: "t", userType: UserType.EXTERNAL };
const internal = { accessToken: "t", userType: UserType.INTERNAL };

function isPassThrough(res: Response) {
  return res.headers.get("x-middleware-next") === "1";
}

describe("proxy auth routing", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("always lets accept-invite through, even when logged in", async () => {
    const proxy = await loadProxy();
    expect(isPassThrough(await proxy(request("/accept-invite", internal)))).toBe(true);
  });

  it("permanently redirects /home to /", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/home"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it.each(["/", "/groups", "/categories", "/login", "/signup"])(
    "lets anonymous visitors open %s",
    async (path) => {
      const proxy = await loadProxy();
      expect(isPassThrough(await proxy(request(path)))).toBe(true);
    },
  );

  it.each(["/dashboard", "/dashboard/x", "/internal", "/internal/users"])(
    "sends anonymous visitors from %s to login",
    async (path) => {
      const proxy = await loadProxy();
      const res = await proxy(request(path));
      const location = new URL(res.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("from")).toBe(path);
    },
  );

  it("treats an unknown user type cookie as logged out", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/dashboard", { accessToken: "t", userType: "ADMIN" }));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("treats a missing user type cookie as logged out", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/dashboard", { accessToken: "t" }));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("sends logged-in users away from auth pages to their home", async () => {
    const proxy = await loadProxy();
    expect((await proxy(request("/login", external))).headers.get("location")).toBe(
      "http://localhost/",
    );
    expect((await proxy(request("/login", internal))).headers.get("location")).toBe(
      "http://localhost/internal",
    );
  });

  it("keeps external users out of /internal", async () => {
    const proxy = await loadProxy();
    const res = await proxy(request("/internal/users", external));
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("lets external users open the dashboard and public pages", async () => {
    const proxy = await loadProxy();
    expect(isPassThrough(await proxy(request("/dashboard", external)))).toBe(true);
    expect(isPassThrough(await proxy(request("/groups", external)))).toBe(true);
  });

  it("lets internal users open /internal and redirects them off public pages", async () => {
    const proxy = await loadProxy();
    expect(isPassThrough(await proxy(request("/internal/groups", internal)))).toBe(true);
    expect((await proxy(request("/groups", internal))).headers.get("location")).toBe(
      "http://localhost/internal",
    );
  });
});

describe("proxy removed-group handling", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("skips the check when no API url is configured", async () => {
    const proxy = await loadProxy("");
    await proxy(request("/food/my-group"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves a 410 page for a removed group", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 410 }));
    const proxy = await loadProxy("https://api.example.com/");
    const res = await proxy(request("/food/my-group"));
    expect(res.status).toBe(410);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.example.com/group-service/api/v1/groups/food/my-group",
    );
  });

  it("checks Hebrew slugs with single, not double, encoding", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 410 }));
    const proxy = await loadProxy("https://api.example.com");
    const path = `/${encodeURIComponent("בית-כנסת")}/${encodeURIComponent("קבוצה")}`;

    const res = await proxy(request(path));

    expect(res.status).toBe(410);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://api.example.com/group-service/api/v1/groups/${encodeURIComponent(
        "בית-כנסת",
      )}/${encodeURIComponent("קבוצה")}`,
    );
  });

  it("lets live groups through and caches the answer", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const proxy = await loadProxy("https://api.example.com");
    expect(isPassThrough(await proxy(request("/food/live-group")))).toBe(true);
    await proxy(request("/food/live-group"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache server errors", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const proxy = await loadProxy("https://api.example.com");
    await proxy(request("/food/flaky"));
    await proxy(request("/food/flaky"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails open when the check throws", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));
    const proxy = await loadProxy("https://api.example.com");
    expect(isPassThrough(await proxy(request("/food/slow")))).toBe(true);
  });

  it.each(["/groups/new", "/profile/abc", "/categories/food", "/internal/groups", "/a/b/c"])(
    "does not check %s",
    async (path) => {
      const proxy = await loadProxy("https://api.example.com");
      await proxy(request(path, external));
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
