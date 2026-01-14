export default defineNuxtRouteMiddleware((to, from) => {
  const bookingStore = useBookingStore();

  // Сбрасываем флаги загрузки на страницах, не связанных с бронированием
  const nonBookingPages = ["/cabinet", "/confirmation"];
  if (nonBookingPages.includes(to.path)) {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;
  }

  // При переходе на главную страницу всегда сбрасываем состояние загрузки
  if (to.path === "/") {
    // Сбрасываем флаги загрузки, чтобы избежать бесконечного лоадера
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;

    // Если это переход с другой страницы, делаем полный сброс
    if (from.path !== "/" && from.path !== "") {
      bookingStore.forceReset();
    }
  }

  // Проверка таймаута активности (30 минут)
  if (to.path === "/" && typeof window !== "undefined") {
    const lastActivity = sessionStorage.getItem("last-activity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > 30 * 60 * 1000) {
      bookingStore.forceReset();
    }
  }
});
