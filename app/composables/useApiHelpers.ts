import type { ApiError } from "~/composables/useApi";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error &&
    typeof error === "object" &&
    "success" in error &&
    "message" in error
  );
};

export const getValidationErrors = (error: ApiError): string[] => {
  return error.payload || [];
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Произошла неизвестная ошибка";
};

export const useApiHelpers = () => {
  return {
    isApiError,
    getValidationErrors,
    getErrorMessage,
  };
};
