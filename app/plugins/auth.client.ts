import {
  fetchRefreshedAccessToken,
  normalizeApiBaseUrl,
  shouldLogoutOnRefreshError,
} from "~/utils/authToken";

/**
 * При старте SPA восстанавливает access-токен через POST /auth/refresh.
 * Требует Authorization: Bearer (токен из persist) — иначе API отвечает 401.
 * Запускается до route-middleware, поэтому auth-guard видит корректный isAuthenticated.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  if (!authStore.user) return;

  const baseURL = normalizeApiBaseUrl(config.public.apiBase as string);

  try {
    const accessToken = await fetchRefreshedAccessToken(
      baseURL,
      authStore.token,
    );
    authStore.setToken(accessToken);
  } catch (err: unknown) {
    // Logout только при явных auth-ошибках (401/403):
    // токен отозван или сессия истекла на стороне сервера.
    // Сетевые сбои (таймаут, 500, offline) не должны сбрасывать сессию.
    if (shouldLogoutOnRefreshError(err)) {
      authStore.logout();
    }
  }
});
