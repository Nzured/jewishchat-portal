import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorData {
  message?: string;
}

export const createErrorHandler = () => {
  return (error: AxiosError) => {
    const statusCode = error.response?.status;
    const statusMessage = (error.response?.data as ApiErrorData | undefined)?.message;

    if (statusCode === 400 && statusMessage) {
      toast.error(statusMessage);
    } else if (statusCode && statusCode !== 401) {
      toast.error(statusMessage || "Something went wrong");
    }

    return Promise.reject(error);
  };
};

export default createErrorHandler;
