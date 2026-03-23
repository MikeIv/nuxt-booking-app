export default defineNuxtRouteMiddleware((to, from) => {
  const bookingStore = useBookingStore();

  // Сбрасываем флаги загрузки на страницах, не связанных с бронированием
  const nonBookingPages = ["/cabinet", "/confirmation"];
  if (nonBookingPages.includes(to.path)) {
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);
  }

  // При переходе на главную страницу всегда сбрасываем состояние загрузки
  if (to.path === "/") {
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);

    if (from.path !== "/" && from.path !== "") {
      bookingStore.forceReset();
    }
  }

  if (typeof window !== "undefined") {
    const lastActivity = sessionStorage.getItem("last-activity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > 30 * 60 * 1000) {
      bookingStore.forceReset();
    }
    sessionStorage.setItem("last-activity", String(Date.now()));
  }
});
