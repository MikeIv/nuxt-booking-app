export default defineNuxtPlugin(async () => {
  const { fetchBanners } = useBanners();

  try {
    await fetchBanners();
  } catch (error: unknown) {
    // Не блокируем инициализацию приложения при ошибке загрузки баннеров
    if (process.env.NODE_ENV === "development") {
      console.warn("Не удалось загрузить баннеры при инициализации:", error);
    }
  }
});
