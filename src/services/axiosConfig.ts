import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { createErrorHandler } from "./utils/errorHandler";
import { setupInterceptors } from "./utils/setupInterceptors";

declare module "axios" {
  export interface AxiosRequestConfig {
    globalLoader?: boolean;
    skipAuthRefresh?: boolean;
    silentError?: boolean;
  }
}

type UnwrappedMethods = "get" | "post" | "put" | "patch" | "delete";

interface TypedAxiosInstance extends Omit<AxiosInstance, UnwrappedMethods> {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
}) as TypedAxiosInstance;

setupInterceptors(api as unknown as AxiosInstance, createErrorHandler());

export default api;
