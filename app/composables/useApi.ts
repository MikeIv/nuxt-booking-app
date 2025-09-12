// composables/useApi.ts
import type { NitroFetchRequest } from "nitropack";
import type { FetchOptions } from "ofetch";

export interface ApiResponse<T = unknown> {
  success: boolean;
  payload?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: unknown;
}

export const useApi = () => {
  const config = useRuntimeConfig();

  // Всегда используем прямой URL, проксирование убрано
  const baseURL = config.public.apiBase;

  const defaultOptions: FetchOptions = {
    baseURL,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    onRequest({ options }) {
      // Добавляем заголовки авторизации
      try {
        const authStore = useAuthStore();
        const token = authStore.token;

        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      } catch (error) {
        console.warn("Auth store not available:", error);
      }
    },
    onResponseError({ response }) {
      console.error("API Response error:", response);
    },
  };

  const fetchApi = async <T = unknown>(
    request: NitroFetchRequest,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    try {
      const mergedOptions: FetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      };

      console.log("🔄 API Request:", {
        fullUrl: baseURL + request,
        baseURL,
        request,
      });

      const response = await $fetch<ApiResponse<T>>(request, mergedOptions);
      return response;
    } catch (error: unknown) {
      const apiError: ApiError = {
        message: error.data?.message || error.message || "Произошла ошибка",
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      };

      throw apiError;
    }
  };

  // GET запрос
  const get = async <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "GET",
      params,
      ...options,
    });
  };

  // POST запрос
  const post = async <T = unknown>(
    url: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "POST",
      body,
      ...options,
    });
  };

  // PUT запрос
  const put = async <T = unknown>(
    url: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "PUT",
      body,
      ...options,
    });
  };

  // PATCH запрос
  const patch = async <T = unknown>(
    url: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "PATCH",
      body,
      ...options,
    });
  };

  // DELETE запрос
  const del = async <T = unknown>(
    url: string,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "DELETE",
      ...options,
    });
  };

  return {
    fetch: fetchApi,
    get,
    post,
    put,
    patch,
    delete: del,
    baseURL, // экспортируем baseURL для отладки
  };
};

export default useApi;
