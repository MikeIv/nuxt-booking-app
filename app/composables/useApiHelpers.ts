import type { ApiError } from "~/composables/useApi";

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    !(error instanceof Error)
  );
};

export const getValidationErrors = (error: ApiError): string[] => {
  const data = error.data;
  if (Array.isArray(data)) {
    return data.filter((item): item is string => typeof item === "string");
  }
  return [];
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
