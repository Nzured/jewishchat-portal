import { vi } from "vitest";
import { REFRESH_API_PATH, SESSION_API_PATH, USER_TYPE_COOKIE } from "@/configs/const";

type RefreshResult = string | null | Promise<string | null>;

interface FakeAuthApiOptions {
  refresh?: () => RefreshResult;
}

function setUserTypeCookie(value: string | null) {
  document.cookie = value
    ? `${USER_TYPE_COOKIE}=${value}; path=/`
    : `${USER_TYPE_COOKIE}=; path=/; max-age=0`;
}

export function stubAuthApi({ refresh = () => null }: FakeAuthApiOptions = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url === SESSION_API_PATH && method === "POST") {
      const body = JSON.parse(String(init?.body)) as { userType: string };
      setUserTypeCookie(body.userType);
      return new Response(null, { status: 204 });
    }

    if (url === SESSION_API_PATH && method === "DELETE") {
      setUserTypeCookie(null);
      return new Response(null, { status: 204 });
    }

    if (url === REFRESH_API_PATH) {
      const accessToken = await refresh();
      if (accessToken) return Response.json({ accessToken });
      setUserTypeCookie(null);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  const callsTo = (path: string, method = "POST") =>
    fetchMock.mock.calls.filter(
      ([input, init]) => String(input) === path && (init?.method ?? "GET") === method,
    );

  return { fetchMock, callsTo, setUserTypeCookie };
}
