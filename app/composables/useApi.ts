import type { NitroFetchRequest, NitroFetchOptions } from "nitropack";

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

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const useApi = () => {
  const config = useRuntimeConfig();

  // Нормализуем baseURL: убираем /v1 из конца, если он там есть
  let baseURL = config.public.apiBase;
  // Убираем завершающий слэш и /v1 если есть
  baseURL = baseURL.replace(/\/v1\/?$/, "").replace(/\/$/, "");

  if (import.meta.dev) {
    console.log("🔧 useApi initialized with baseURL:", baseURL);
  }

  const refreshToken = async (): Promise<string> => {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      let newToken: string | null = null;

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
          newToken = response.payload.token;
          authStore.setToken(newToken);

          if (import.meta.dev) {
            console.log("✅ Токен успешно обновлен");
          }
        }
      } catch (error: unknown) {
        // Обрабатываем только сетевые/HTTP-ошибки от $fetch
        const status = (error as { status?: number }).status;

        if (import.meta.dev) {
          console.error("❌ Ошибка обновления токена:", error);
          if (status === 401) {
            console.error(
              "⚠️ Refresh token истек или недействителен. Требуется повторная авторизация.",
            );
          }
        }

        useAuthStore().logout();

        const refreshError = new Error(
          status === 401
            ? "Refresh token expired or invalid"
            : "Failed to refresh token",
        ) as Error & { status?: number; isRefreshError?: boolean };
        refreshError.status = status;
        refreshError.isRefreshError = true;

        throw refreshError;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }

      // Успешный HTTP-ответ, но сервер не вернул токен
      if (!newToken) {
        useAuthStore().logout();
        const noTokenError = new Error("Failed to refresh token") as Error & {
          isRefreshError?: boolean;
        };
        noTokenError.isRefreshError = true;
        throw noTokenError;
      }

      return newToken;
    })();

    return refreshPromise;
  };

  const defaultOptions: NitroFetchOptions<NitroFetchRequest> = {
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
    options: NitroFetchOptions<NitroFetchRequest> = {},
    retryCount = 0,
  ): Promise<ApiResponse<T>> => {
    try {
      const authStore = useAuthStore();
      const token = authStore.token;

      if (import.meta.dev) {
        console.log(
          "🔐 Token status:",
          token ? `Present (${token.substring(0, 20)}...)` : "Missing",
        );
      }

      const mergedOptions: NitroFetchOptions<NitroFetchRequest> = {
        ...defaultOptions,
        ...options,
        baseURL,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
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

      return await $fetch<ApiResponse<T>>(request, mergedOptions);
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;

      if (
        status === 401 &&
        !request.toString().includes("/auth/refresh") &&
        retryCount === 0
      ) {
        if (import.meta.dev) {
          console.log(`⚠️ Получен статус ${status}, пробуем обновить токен...`);
        }

        try {
          await refreshToken();

          if (import.meta.dev) {
            console.log("🔁 Повторяем запрос с новым токеном...");
          }

          return await fetchApi<T>(request, options, retryCount + 1);
        } catch (refreshError: unknown) {
          const refreshStatus = (refreshError as { status?: number }).status;
          const isRefreshError = (refreshError as { isRefreshError?: boolean })
            .isRefreshError;

          if (import.meta.dev) {
            if (refreshStatus === 401 || isRefreshError) {
              console.error(
                "❌ Refresh token истек или недействителен. Требуется повторная авторизация.",
              );
            } else {
              console.error(
                "❌ Не удалось обновить токен, перенаправляем на логин",
              );
            }
          }

          if (refreshStatus === 401 || isRefreshError) {
            throw {
              message: "Сессия истекла. Требуется повторная авторизация.",
              status: 401,
              statusText: "Unauthorized",
              data: { requiresReauth: true },
            } satisfies ApiError;
          }

          throw {
            message:
              (refreshError as { message?: string })?.message ||
              "Не удалось обновить токен",
            status: refreshStatus || 401,
            statusText: "Token refresh failed",
            data: refreshError,
          } satisfies ApiError;
        }
      }

      const errMessage = (error as { message?: string }).message ?? "";
      const isAbortOrTimeout =
        (error as { name?: string }).name === "AbortError" ||
        /abort|timeout|load response data/i.test(errMessage);

      throw {
        message: isAbortOrTimeout
          ? "Сервер не ответил вовремя. Проверьте соединение и попробуйте снова."
          : (error as { data?: { message?: string } }).data?.message ||
            errMessage ||
            "Произошла ошибка",
        status: isAbortOrTimeout ? 408 : status,
        statusText: isAbortOrTimeout
          ? "Request Timeout"
          : (error as { statusText?: string }).statusText,
        data: (error as { data?: unknown }).data,
      } satisfies ApiError;
    }
  };

  const get = async <T = unknown>(
    url: string,
    query?: Record<string, unknown>,
    options: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "GET",
      query,
      ...options,
    });
  };

  const post = async <T = unknown>(
    url: string,
    body?: NitroFetchOptions<NitroFetchRequest>["body"],
    options: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "POST",
      body,
      ...options,
    });
  };

  const put = async <T = unknown>(
    url: string,
    body?: NitroFetchOptions<NitroFetchRequest>["body"],
    options: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "PUT",
      body,
      ...options,
    });
  };

  const patch = async <T = unknown>(
    url: string,
    body?: NitroFetchOptions<NitroFetchRequest>["body"],
    options: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<ApiResponse<T>> => {
    return fetchApi<T>(url, {
      method: "PATCH",
      body,
      ...options,
    });
  };

  const del = async <T = unknown>(
    url: string,
    options: NitroFetchOptions<NitroFetchRequest> = {},
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
    baseURL,
  };
};
