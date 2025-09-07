export default defineNuxtRouteMiddleware((to, from) => {
  const bookingStore = useBookingStore();

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
