import axios from "axios";
import { createErrorHandler } from "./utils/errorHandler";
import { setupInterceptors } from "./utils/setupInterceptors";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

setupInterceptors(api, createErrorHandler());

export default api;
