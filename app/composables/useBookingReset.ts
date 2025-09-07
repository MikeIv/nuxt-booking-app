export const useBookingReset = () => {
  const bookingStore = useBookingStore();
  const route = useRoute();

  const handleRouteChange = () => {
    if (route.path === "/" && bookingStore.searchResults) {
      bookingStore.forceReset();
    }
  };

  // Сброс при закрытии/обновлении страницы
  const handleBeforeUnload = () => {
    bookingStore.forceReset();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      bookingStore.forceReset();
    }
  };

  onMounted(() => {
    watch(() => route.path, handleRouteChange, { immediate: true });

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("pagehide", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  });
};
