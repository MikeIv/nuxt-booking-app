<script setup lang="ts">
  import Carousel from "primevue/carousel";

  interface PlaceholderSlide {
    placeholder: true;
    label?: string;
  }

  type CarouselItem = string | PlaceholderSlide;

  const isPlaceholderSlide = (item: CarouselItem): item is PlaceholderSlide => {
    return typeof item === "object" && item?.placeholder === true;
  };

  interface Props {
    images: CarouselItem[];
    altPrefix: string;
    altText: string;
  }

  const props = defineProps<Props>();

  const imageLoading = ref(true);
  const hasRealImages = computed(() =>
    props.images.some((image) => typeof image === "string" && image.length > 0),
  );

  const imageLoaded = () => {
    imageLoading.value = false;
  };

  const imageError = () => {
    imageLoading.value = false;
  };

  watch(
    hasRealImages,
    (value) => {
      imageLoading.value = value;
    },
    { immediate: true },
  );

  const showSkeleton = computed(
    () => hasRealImages.value && imageLoading.value,
  );
  const showNavigatorsValue = computed(() => props.images.length > 1);

  const carouselItems = computed(() => {
    const items = props.images;
    if (items.length === 0) {
      return items;
    }

    const minItems = 9;
    if (items.length < minItems) {
      const multiplier = Math.ceil(minItems / items.length) + 2;
      return Array(multiplier).fill(items).flat();
    }

    return [...items, ...items, ...items];
  });

  const responsiveOptions = ref([
    {
      breakpoint: "1023px",
      numVisible: 1,
      numScroll: 1,
    },
  ]);
</script>

<template>
  <Carousel
    :value="carouselItems"
    :num-visible="3"
    :num-scroll="1"
    :responsive-options="responsiveOptions"
    circular
    :show-indicators="false"
    :show-navigators="showNavigatorsValue"
    :class="$style.carouselBlock"
  >
    <template #item="slotProps">
      <div :class="$style.carouselItem">
        <template v-if="!isPlaceholderSlide(slotProps.data)">
          <img
            :src="slotProps.data"
            :alt="`${altPrefix} ${altText}`"
            :class="[$style.carouselImage, { [$style.loaded]: !imageLoading }]"
            @load="imageLoaded"
            @error="imageError"
          >
          <div v-if="showSkeleton" :class="$style.skeletonLoader" />
        </template>
        <div v-else :class="$style.placeholderSlide">
          <span>{{ slotProps.data.label ?? "Room Photo" }}</span>
        </div>
      </div>
    </template>
  </Carousel>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .carouselBlock {
    :global {
      .p-carousel {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .p-carousel-indicators {
        display: none !important;
      }

      .p-carousel-indicator-list {
        display: none !important;
      }

      .p-carousel-content {
        position: relative;
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
        padding: 0;

        .p-button-text.p-button-secondary {
          width: rem(16);
          height: rem(40);
          color: var(--a-accentDarkBg);

          &:hover {
            color: var(--a-text-dark);
            background-color: var(--a-lightPrimaryBg);
          }

          svg {
            width: rem(24);
            height: rem(40);
          }

          &.p-carousel-prev-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: rem(30);
            z-index: 1000;
          }

          &.p-carousel-next-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: rem(30);
            z-index: 1000;
          }
        }
      }

      .p-carousel-content-container,
      .p-carousel-items-container {
        width: 100%;
        padding: 0;
        margin: 0;
      }

      .p-carousel-items-container {
        margin: 0 rem(-14);
        overflow: hidden;
      }

      .p-carousel-items-content {
        display: flex;
        transition: transform 0.3s ease;
      }

      .p-carousel-item {
        padding: 0 rem(14);
        flex: 0 0 auto;
        min-width: 0;
      }
    }
  }

  .carouselItem {
    position: relative;
    width: 100%;
    min-height: rem(400);

    @media (min-width: #{size.$desktopMin}) {
      min-height: rem(600);
    }
  }

  .carouselImage {
    width: 100%;
    height: 100%;
    min-height: rem(400);
    object-fit: cover;
    border-radius: rem(12);
    opacity: 0;
    transition: opacity 0.3s ease;

    @media (min-width: #{size.$desktopMin}) {
      min-height: rem(600);
    }

    &.loaded {
      opacity: 1;
    }
  }

  .placeholderSlide {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: rem(400);
    height: 100%;
    border-radius: rem(12);
    background-color: var(--a-accentLightBg);
    color: var(--a-text-light);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;

    @media (min-width: #{size.$desktopMin}) {
      min-height: rem(600);
    }
  }

  .skeletonLoader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: rem(400);
    height: 100%;
    background: linear-gradient(
      45deg,
      var(--a-lightBg) 25%,
      var(--ui-color-secondary-50) 50%,
      var(--ui-color-secondary-200) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: rem(12);

    @media (min-width: #{size.$desktopMin}) {
      min-height: rem(600);
    }
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
