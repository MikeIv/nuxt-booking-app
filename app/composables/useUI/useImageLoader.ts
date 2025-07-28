import type { Ref } from "vue";

export const useImageLoader = () => {
  const loadImages = async (pattern: string): Promise<string[]> => {
    try {
      const images = import.meta.glob("~/assets/**/*.{jpg,png,webp}", {
        eager: true,
        import: "default",
      });

      // Фильтруем изображения по переданному паттерну
      const matchedImages = Object.entries(images)
        .filter(([path]) => path.includes(pattern.replace("~/assets/", "")))
        .map(([, image]) => image as string);

      return matchedImages;
    } catch (error) {
      console.error("Error loading images:", error);
      return [];
    }
  };

  const useImages = (pattern: string): Ref<string[]> => {
    const images = ref<string[]>([]);

    onMounted(async () => {
      images.value = await loadImages(pattern);
    });

    return images;
  };

  return {
    loadImages,
    useImages,
  };
};
