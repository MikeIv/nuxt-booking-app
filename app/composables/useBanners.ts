import type { BannersPayload } from "~/types/banner";

export const useBanners = () => {
  const { get } = useApi();

  const banners = useState<BannersPayload | null>("banners", () => null);
  const loading = useState<boolean>("banners-loading", () => false);
  const error = useState<string | null>("banners-error", () => null);
  const fetchPromise = useState<Promise<void> | null>(
    "banners-fetch-promise",
    () => null,
  );

  const fetchBanners = async (force = false): Promise<void> => {
    // Если данные уже загружены и не требуется принудительное обновление - пропускаем запрос
    if (!force && banners.value !== null && !error.value) {
      return;
    }

    // Если уже идет загрузка, возвращаем существующий промис
    if (loading.value && fetchPromise.value) {
      return fetchPromise.value;
    }

    loading.value = true;
    error.value = null;

    const fetchData = async (): Promise<void> => {
      try {
        const response = await get<BannersPayload>("/v1/site/banners");

        if (response.success && response.payload) {
          banners.value = response.payload;
          error.value = null;
        } else {
          error.value = response.message || "Не удалось загрузить баннеры";
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Произошла ошибка при загрузке баннеров";
        error.value = errorMessage;
        console.error("Ошибка загрузки баннеров:", err);
      } finally {
        loading.value = false;
        fetchPromise.value = null;
      }
    };

    const promise = fetchData();
    fetchPromise.value = promise;
    return promise;
  };

  const getBannersByVisibility = (visibility: string): BannersPayload => {
    if (!banners.value) {
      return [];
    }

    if (!Array.isArray(banners.value)) {
      console.error(
        "getBannersByVisibility: banners.value не является массивом:",
        typeof banners.value,
        banners.value,
      );
      return [];
    }

    const filtered = banners.value.filter(
      (banner) =>
        Array.isArray(banner.visible) && banner.visible.includes(visibility),
    );

    return filtered;
  };

  return {
    banners: readonly(banners),
    loading: readonly(loading),
    error: readonly(error),
    fetchBanners,
    getBannersByVisibility,
  };
};
