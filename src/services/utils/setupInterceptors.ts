import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { trackPromise } from "react-promise-tracker";
import { REFRESH_TOKEN_ENDPOINT } from "@/configs/const";
import { clearAuthSession, getAccessToken, getRefreshToken, updateAccessToken } from "@/lib/auth";
import type { LoginData } from "@/services/auth/auth.types";
import { ApiResponse } from "@/types/Common";

const handleUnauthorized = () => {
  if (typeof window === "undefined") return;

  clearAuthSession();
  window.location.href = "/login";
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiResponse<LoginData>>(
      `${process.env.NEXT_PUBLIC_API_URL || "/api"}${REFRESH_TOKEN_ENDPOINT}`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` } },
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    updateAccessToken(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
};

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const TRACKED_METHODS = ["get", "post", "put", "patch", "delete"] as const;

// Index of the AxiosRequestConfig argument for each convenience method's
// (url, config) or (url, data, config) signature.
const CONFIG_ARG_INDEX: Record<(typeof TRACKED_METHODS)[number], number> = {
  get: 1,
  delete: 1,
  post: 2,
  put: 2,
  patch: 2,
};

export const setupInterceptors = (
  instance: AxiosInstance,
  errorHandler: (error: AxiosError) => Promise<never>,
) => {
  // axios.create() binds get/post/put/patch/delete to its own internal
  // Axios instance, not to `instance` itself, so they never go through
  // `instance.request` — wrapping that alone silently tracks nothing.
  // Each convenience method has to be wrapped directly instead. Only
  // requests that opt in via `{ globalLoader: true }` feed the tracker
  // that drives the full-screen GlobalLoader overlay.
  type MethodFn = (...args: unknown[]) => Promise<unknown>;
  const untypedInstance = instance as unknown as Record<string, MethodFn>;
  TRACKED_METHODS.forEach((method) => {
    const original = untypedInstance[method].bind(instance);
    untypedInstance[method] = (...args: unknown[]) => {
      const config = args[CONFIG_ARG_INDEX[method]] as AxiosRequestConfig | undefined;
      const promise = original(...args);
      return config?.globalLoader ? trackPromise(promise, "global") : promise;
    };
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined;

      if (error.response?.status === 401) {
        // Requests that are unauthenticated by design (login, signup, invite
        // validation, ...) are marked with skipAuthRefresh — a 401 from them
        // means "bad credentials/token", not "session expired", so they
        // should never trigger a refresh or force-redirect. Fall back to the
        // same check by access-token presence for anything unmarked, since a
        // 401 with no token on file couldn't be an expired session either.
        if (config?.skipAuthRefresh || !getAccessToken()) {
          return errorHandler(error);
        }

        if (config && !config._retry) {
          config._retry = true;

          // Dedup concurrent 401s so only one refresh request is in flight.
          refreshPromise ??= refreshAccessToken().finally(() => {
            refreshPromise = null;
          });

          const newAccessToken = await refreshPromise;
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance.request(config);
          }

          handleUnauthorized();
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }

      return errorHandler(error);
    },
  );
};

export default setupInterceptors;
