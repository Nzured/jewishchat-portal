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
      undefined,
      { headers: { Authorization: refreshToken } },
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
  _startedAt?: number;
}

const isServer = typeof window === "undefined";
const requestLabel = (config: AxiosRequestConfig) =>
  `${(config.method ?? "get").toUpperCase()} ${config.url}`;

const TRACKED_METHODS = ["get", "post", "put", "patch", "delete"] as const;
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
    (config as RetriableConfig)._startedAt = Date.now();
    console.log(`[api] → ${requestLabel(config)} (${isServer ? "server" : "browser"})`);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const config = response.config as RetriableConfig;
      const ms = config._startedAt ? Date.now() - config._startedAt : "?";
      console.log(`[api] ← ${response.status} ${requestLabel(config)} (${ms}ms)`);
      return response.data;
    },
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined;
      if (config) {
        const ms = config._startedAt ? Date.now() - config._startedAt : "?";
        console.log(
          `[api] ✗ ${error.response?.status ?? "network error"} ${requestLabel(config)} (${ms}ms)`,
        );
      }

      if (error.response?.status === 401) {
        if (config?.skipAuthRefresh || !getAccessToken()) {
          return errorHandler(error);
        }

        if (config && !config._retry) {
          config._retry = true;

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
