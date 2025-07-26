import type { GlobEagerImport } from "#imports";

type ImageModule = { default: string };

export const useBackgroundSlider = () => {
  const desktopImages = ref<string[]>([]);
  const mobileImages = ref<string[]>([]);

  const loadImages = async () => {
    try {
      const deskImgs = import.meta.glob("~/assets/images/bg-slider/[1-4].jpg", {
        eager: true,
      }) as GlobEagerImport<ImageModule>;
      desktopImages.value = Object.values(deskImgs).map((img) => img.default);

      const mobImgs = import.meta.glob(
        "~/assets/images/bg-slider/mob/[1-4].jpg",
        {
          eager: true,
        },
      ) as GlobEagerImport<ImageModule>;
      mobileImages.value = Object.values(mobImgs).map((img) => img.default);
    } catch (error) {
      console.error("Error loading slider images:", error);
      // Можно добавить обработку ошибок или fallback-изображения
    }
  };

  return {
    desktopImages,
    mobileImages,
    loadImages,
  };
};
