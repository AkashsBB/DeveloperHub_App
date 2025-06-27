import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;
    const status = error.response?.status;

    switch (status) {
      case 400:
        return { message: responseData?.message || "Invalid request", status, errors: responseData?.errors };
      case 401:
        return { message: "Please log in again", status };
      case 403:
        return { message: "Access denied", status };
      case 404:
        return { message: "Resource not found", status };
      case 500:
        return { message: "Server error, try again later", status };
      default:
        return { message: responseData?.message || "An error occurred", status };
    }
  }

  return { message: error instanceof Error ? error.message : "An unexpected error occurred" };
};

export const showApiErrorToast = (error: unknown): void => {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
  if (apiError.errors) {
    Object.entries(apiError.errors).forEach(([field, messages]) => {
      messages.forEach((message) => toast.error(`${field}: ${message}`));
    });
  }
};