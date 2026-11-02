import { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { trackPromise } from "react-promise-tracker";
import { toast } from "sonner";
import {
  clearAuthSession,
  ensureAccessToken,
  getAccessToken,
  hasSession,
  refreshAccessToken,
} from "@/lib/auth";
import { reportRequestDuration, reportRequestTimeout } from "@/lib/networkHealth";

const handleUnauthorized = async () => {
  if (typeof window === "undefined") return;

  await clearAuthSession();
  window.location.href = "/login";
};

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _startedAt?: number;
}

const isServer = typeof window === "undefined";
const logApi = process.env.NODE_ENV !== "production";
const requestLabel = (config: AxiosRequestConfig) =>
  `${(config.method ?? "get").toUpperCase()} ${config.url}`;

const TRACKED_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);
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

  instance.interceptors.request.use(async (config) => {
    const token = config.skipAuthRefresh ? getAccessToken() : await ensureAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    (config as RetriableConfig)._startedAt = Date.now();
    if (logApi) {
      console.log(`[api] → ${requestLabel(config)} (${isServer ? "server" : "browser"})`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const config = response.config as RetriableConfig;
      const elapsed = config._startedAt ? Date.now() - config._startedAt : null;
      if (logApi) {
        console.log(`[api] ← ${response.status} ${requestLabel(config)} (${elapsed ?? "?"}ms)`);
      }
      if (!isServer && navigator.onLine && elapsed !== null) reportRequestDuration(elapsed);

      if (
        typeof window !== "undefined" &&
        !config.silentSuccess &&
        MUTATING_METHODS.has((config.method ?? "get").toLowerCase())
      ) {
        const message = (response.data as { message?: string } | undefined)?.message;
        if (message) toast.success(message);
      }

      return response.data;
    },
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined;
      const elapsed = config?._startedAt ? Date.now() - config._startedAt : null;
      if (logApi && config) {
        console.log(
          `[api] ✗ ${error.response?.status ?? "network error"} ${requestLabel(config)} (${elapsed ?? "?"}ms)`,
        );
      }
      if (!isServer && navigator.onLine) {
        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") reportRequestTimeout();
        else if (elapsed !== null) reportRequestDuration(elapsed);
      }

      if (error.response?.status === 401) {
        if (config?.skipAuthRefresh || !hasSession()) {
          return errorHandler(error);
        }

        if (config && !config._retry) {
          config._retry = true;

          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance.request(config);
          }

          await handleUnauthorized();
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }

      return errorHandler(error);
    },
  );
};

export default setupInterceptors;
