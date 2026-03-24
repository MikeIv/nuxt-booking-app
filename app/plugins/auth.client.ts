import type { ApiResponse } from "~/composables/useApi";

/**
 * При старте SPA тихо восстанавливает access-токен через httpOnly refresh cookie.
 * Если refresh не удался — очищаем сессию.
 * Запускается до route-middleware, поэтому auth-guard видит корректный isAuthenticated.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  if (!authStore.user) return;

  let baseURL = config.public.apiBase as string;
  baseURL = baseURL.replace(/\/v1\/?$/, "").replace(/\/$/, "");

  try {
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
      authStore.setToken(response.payload.token);
    } else {
      // API ответил успешно, но refresh не прошёл (нет токена в payload)
      authStore.logout();
    }
  } catch (err: unknown) {
    // Logout только при явных auth-ошибках (401/403):
    // токен отозван или сессия истекла на стороне сервера.
    // Сетевые сбои (таймаут, 500, offline) не должны сбрасывать сессию.
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401 || status === 403) {
      authStore.logout();
    }
  }
});
