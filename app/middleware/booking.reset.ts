export default defineNuxtRouteMiddleware((to, from) => {
  const bookingStore = useBookingStore();

  // Сбрасываем флаги загрузки на страницах, не связанных с бронированием
  const nonBookingPages = ["/cabinet", "/confirmation"];
  if (nonBookingPages.includes(to.path)) {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;
  }

  if (to.path === "/" && from.path !== "/") {
    bookingStore.forceReset();
  }

  if (to.path === "/" && typeof window !== "undefined") {
    const lastActivity = sessionStorage.getItem("last-activity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > 30 * 60 * 1000) {
      bookingStore.forceReset();
    }
  }
});
