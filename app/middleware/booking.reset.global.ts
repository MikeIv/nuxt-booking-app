/**
 * Глобальный middleware управления состоянием бронирования.
 *
 * Ответственности:
 * 1. Сброс booking-state при переходе на / (включая первый вход в приложение)
 * 2. Сброс флагов загрузки на страницах вне флоу бронирования
 * 3. Обновление last-activity для тайм-аута сессии
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const bookingStore = useBookingStore();

  // Сброс флагов загрузки на страницах вне флоу бронирования
  const nonBookingPages = ["/cabinet", "/confirmation", "/cancellation"];
  if (nonBookingPages.includes(to.path)) {
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);
  }

  // При переходе на главную сбрасываем всё состояние бронирования.
  // from.path === "/" исключает повторный сброс при навигации внутри /
  let didReset = false;
  if (to.path === "/" && from.path !== "/") {
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);
    bookingStore.forceReset();
    didReset = true;
  }

  if (!didReset && typeof window !== "undefined") {
    const lastActivity = sessionStorage.getItem("last-activity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > 30 * 60 * 1000) {
      bookingStore.forceReset();
    }
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem("last-activity", String(Date.now()));
  }
});
