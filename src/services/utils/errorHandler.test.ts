import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { createErrorHandler } from "./errorHandler";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

function axiosError(status?: number, data?: unknown, config: Partial<InternalAxiosRequestConfig> = {}) {
  const error = new AxiosError("failed");
  error.config = { headers: {}, ...config } as InternalAxiosRequestConfig;
  if (status) {
    error.response = {
      status,
      data,
      statusText: "",
      headers: {},
      config: error.config,
    };
  }
  return error;
}

describe("createErrorHandler", () => {
  const handle = createErrorHandler();

  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it("always rejects with the original error", async () => {
    const error = axiosError(500);
    await expect(handle(error)).rejects.toBe(error);
  });

  it("shows the API message for a 400", async () => {
    await handle(axiosError(400, { message: "Name is required" })).catch(() => {});
    expect(toast.error).toHaveBeenCalledWith("Name is required");
  });

  it("shows the API message for other statuses", async () => {
    await handle(axiosError(409, { message: "Already exists" })).catch(() => {});
    expect(toast.error).toHaveBeenCalledWith("Already exists");
  });

  it("shows a generic message when the API sends none", async () => {
    await handle(axiosError(500)).catch(() => {});
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("stays silent for network errors without a status", async () => {
    await handle(axiosError()).catch(() => {});
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("stays silent when the request asked for it", async () => {
    await handle(axiosError(500, { message: "x" }, { silentError: true })).catch(() => {});
    expect(toast.error).not.toHaveBeenCalled();
  });
});
