/**
 * Middleware: запрещает доступ к страницам личного кабинета без авторизации.
 * При переходе на /cabinet без токена выполняет редирект на главную
 * (в т.ч. при нажатии «Назад» после выхода).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/cabinet") {
    return;
  }

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return navigateTo("/", { replace: true });
  }
});
