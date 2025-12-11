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
  // Нормализуем baseURL: убираем /v1 из конца, если он там есть
  let baseURL = config.public.apiBase;
  // Убираем завершающий слэш и /v1 если есть
  baseURL = baseURL.replace(/\/v1\/?$/, "").replace(/\/$/, "");

  if (import.meta.dev) {
    console.log("🔧 useApi initialized with baseURL:", baseURL);
  }

  // Флаг для предотвращения множественных попыток обновления токена
  let isRefreshing = false;
  let refreshPromise: Promise<string> | null = null;

  // Функция для обновления токена
  const refreshToken = async (): Promise<string> => {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        if (import.meta.dev) {
          console.log("🔄 Обновление токена...");
        }

        const authStore = useAuthStore();
        const response = await $fetch<ApiResponse<{ token: string }>>(
          "/v1/auth/refresh",
          {
            method: "POST",
            baseURL,
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        if (response.success && response.payload?.token) {
          const newToken = response.payload.token;
          authStore.setToken(newToken);

          if (import.meta.dev) {
            console.log("✅ Токен успешно обновлен");
          }

          return newToken;
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (error) {
        if (import.meta.dev) {
          console.error("❌ Ошибка обновления токена:", error);
        }
        const authStore = useAuthStore();
        authStore.logout();
        throw error;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const defaultOptions: FetchOptions = {
    baseURL,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    onResponseError({ response }) {
      if (import.meta.dev) {
        console.error("API Response error:", response);
      }
    },
  };

  const fetchApi = async <T = unknown>(
    request: NitroFetchRequest,
    options: FetchOptions = {},
    retryCount = 0,
  ): Promise<ApiResponse<T>> => {
    try {
      // Получаем токен для заголовка
      const authStore = useAuthStore();
      const token = authStore.token;

      if (import.meta.dev) {
        console.log(
          "🔐 Token status:",
          token ? `Present (${token.substring(0, 20)}...)` : "Missing",
        );
      }

      const mergedOptions: FetchOptions = {
        ...defaultOptions,
        ...options,
        baseURL, // Явно добавляем baseURL
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
          // Добавляем Authorization заголовок, если токен есть
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (import.meta.dev) {
        console.log("🔄 API Request:", {
          fullUrl: baseURL + request,
          baseURL,
          request,
          retry: retryCount,
          hasToken: !!token,
          headers: mergedOptions.headers,
        });
      }

      const response = await $fetch<ApiResponse<T>>(request, mergedOptions);
      return response;
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;

      // Если ошибка 401/302 и это не запрос на refresh, пробуем обновить токен
      if (
        (status === 401 || status === 302) &&
        !request.toString().includes("/auth/refresh") &&
        retryCount === 0
      ) {
        if (import.meta.dev) {
          console.log(`⚠️ Получен статус ${status}, пробуем обновить токен...`);
        }

        try {
          // Обновляем токен
          await refreshToken();

          // Повторяем запрос с обновленным токеном
          if (import.meta.dev) {
            console.log("🔁 Повторяем запрос с новым токеном...");
          }

          return await fetchApi<T>(request, options, retryCount + 1);
        } catch {
          if (import.meta.dev) {
            console.error(
              "❌ Не удалось обновить токен, перенаправляем на логин",
            );
          }
          // Если обновление токена не удалось, можно перенаправить на страницу входа
          const router = useRouter();
          router.push("/");
        }
      }

      const apiError: ApiError = {
        message:
          (error as { data?: { message?: string } }).data?.message ||
          (error as { message?: string }).message ||
          "Произошла ошибка",
        status: status,
        statusText: (error as { statusText?: string }).statusText,
        data: (error as { data?: unknown }).data,
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
