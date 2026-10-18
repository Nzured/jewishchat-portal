import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackPromise } from "react-promise-tracker";
import { toast } from "sonner";
import { clearAuthSession, getAccessToken, setAuthSession } from "@/lib/auth";
import { UserType } from "@/types/User";
import { setupInterceptors } from "./setupInterceptors";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock("react-promise-tracker", () => ({
  trackPromise: vi.fn((promise: Promise<unknown>) => promise),
}));

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

function createInstance(handler: Handler) {
  const seen: (string | undefined)[] = [];
  const adapter: AxiosAdapter = (config) => {
    seen.push(authHeader(config));
    const { status, data } = handler(config);
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) {
      return Promise.reject(
        new AxiosError("failed", undefined, config, undefined, response),
      );
    }
    return Promise.resolve(response);
  };
  const instance = axios.create({ adapter, baseURL: "http://api.test" });
  const errorHandler = vi.fn((error: AxiosError) => Promise.reject(error));
  setupInterceptors(instance, errorHandler);
  return { instance, seen, errorHandler };
}

function authHeader(config: InternalAxiosRequestConfig) {
  return config.headers.Authorization as string | undefined;
}

describe("setupInterceptors", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.clear();
    clearAuthSession();
    vi.mocked(toast.success).mockClear();
    vi.mocked(trackPromise).mockClear();
  });

  it("unwraps the response body", async () => {
    const { instance } = createInstance(() => ({ status: 200, data: { data: 1 } }));
    await expect(instance.get("/x")).resolves.toEqual({ data: 1 });
  });

  it("adds the bearer token when logged in", async () => {
    setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);
    const { instance, seen } = createInstance(() => ({ status: 200 }));
    await instance.get("/x");
    expect(seen[0]).toBe("Bearer access-1");
  });

  it("sends no auth header when logged out", async () => {
    const { instance, seen } = createInstance(() => ({ status: 200 }));
    await instance.get("/x");
    expect(seen[0]).toBeUndefined();
  });

  it("toasts the API message after a successful mutation", async () => {
    const { instance } = createInstance(() => ({ status: 200, data: { message: "Saved" } }));
    await instance.post("/x", {});
    expect(toast.success).toHaveBeenCalledWith("Saved");
  });

  it("does not toast for reads or silent mutations", async () => {
    const { instance } = createInstance(() => ({ status: 200, data: { message: "Hi" } }));
    await instance.get("/x");
    await instance.post("/x", {}, { silentSuccess: true });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("tracks requests that ask for the global loader", async () => {
    const { instance } = createInstance(() => ({ status: 200 }));
    await instance.get("/x", { globalLoader: true });
    await instance.post("/x", {}, { globalLoader: true });
    await instance.get("/x");
    expect(trackPromise).toHaveBeenCalledTimes(2);
  });

  it("passes non-401 errors to the error handler", async () => {
    const { instance, errorHandler } = createInstance(() => ({ status: 500 }));
    await expect(instance.get("/x")).rejects.toBeInstanceOf(AxiosError);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  it("does not try to refresh a 401 when logged out", async () => {
    const refresh = vi.spyOn(axios, "post");
    const { instance, errorHandler } = createInstance(() => ({ status: 401 }));
    await expect(instance.get("/x")).rejects.toBeInstanceOf(AxiosError);
    expect(refresh).not.toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token once and retries a 401 with the new token", async () => {
    setAuthSession("old", "refresh-1", UserType.EXTERNAL);
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({
      data: { data: { accessToken: "new", refreshToken: "refresh-2" } },
    });
    const { instance, seen } = createInstance((config) =>
      authHeader(config) === "Bearer new" ? { status: 200, data: "ok" } : { status: 401 },
    );

    await expect(instance.get("/x")).resolves.toBe("ok");

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh.mock.calls[0][2]).toMatchObject({ headers: { Authorization: "refresh-1" } });
    expect(seen).toEqual(["Bearer old", "Bearer new"]);
    expect(getAccessToken()).toBe("new");
  });

  it("shares a single refresh between concurrent 401s", async () => {
    setAuthSession("old", "refresh-1", UserType.EXTERNAL);
    let resolveRefresh!: (value: unknown) => void;
    const refresh = vi.spyOn(axios, "post").mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    const { instance } = createInstance((config) =>
      authHeader(config) === "Bearer new" ? { status: 200, data: "ok" } : { status: 401 },
    );

    const requests = Promise.all([instance.get("/a"), instance.get("/b"), instance.get("/c")]);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    resolveRefresh({ data: { data: { accessToken: "new", refreshToken: "refresh-2" } } });

    await expect(requests).resolves.toEqual(["ok", "ok", "ok"]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("logs out when the refresh fails", async () => {
    setAuthSession("old", "refresh-1", UserType.EXTERNAL);
    vi.spyOn(axios, "post").mockRejectedValue(new Error("expired"));
    const { instance } = createInstance(() => ({ status: 401 }));

    await expect(instance.get("/x")).rejects.toBeInstanceOf(AxiosError);
    expect(getAccessToken()).toBeNull();
  });

  it("does not refresh when the request opted out", async () => {
    setAuthSession("old", "refresh-1", UserType.EXTERNAL);
    const refresh = vi.spyOn(axios, "post");
    const { instance } = createInstance(() => ({ status: 401 }));
    await expect(instance.get("/x", { skipAuthRefresh: true })).rejects.toBeInstanceOf(
      AxiosError,
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});
