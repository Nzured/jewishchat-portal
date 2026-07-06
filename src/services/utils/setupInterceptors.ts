import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { trackPromise } from "react-promise-tracker";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const authData = localStorage.getItem("auth");
    if (!authData) return null;

    const parsed = JSON.parse(authData) as { accessToken?: string };
    return typeof parsed.accessToken === "string" ? parsed.accessToken : null;
  } catch {
    return null;
  }
};

const handleUnauthorized = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth");
  window.location.href = "/login";
};

export const setupInterceptors = (
  instance: AxiosInstance,
  errorHandler: (error: AxiosError) => Promise<never>,
) => {
  const originalRequest = instance.request.bind(instance);
  instance.request = (<T = unknown>(config: AxiosRequestConfig) =>
    trackPromise(originalRequest<T>(config))) as typeof instance.request;

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return Promise.reject(error);
      }
      return errorHandler(error);
    },
  );
};

export default setupInterceptors;
