type CarouselItem = string | { placeholder: true; label?: string };

export const useRoomCarousel = (
  photos: MaybeRef<string[]>,
  minPhotosBeforePlaceholders: number = 2,
  targetItems: number = 3,
  placeholderLabel: string = "Room Photo",
) => {
  const photosValue = toRef(photos);

  const createPlaceholder = (): CarouselItem => ({
    placeholder: true,
    label: placeholderLabel,
  });

  const carouselImages = computed<CarouselItem[]>(() => {
    const photosArray = photosValue.value || [];
    const photosCount = photosArray.length;

    if (photosCount >= minPhotosBeforePlaceholders) {
      return photosArray;
    }

    const placeholdersNeeded = targetItems - photosCount;
    const placeholders = Array.from(
      { length: placeholdersNeeded },
      createPlaceholder,
    );

    return [...photosArray, ...placeholders];
  });

  return {
    carouselImages,
  };
};
