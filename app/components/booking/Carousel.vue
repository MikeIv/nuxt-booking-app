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
    height?: string;
    showNavigators?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: "auto",
    showNavigators: undefined,
  });

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

  const showSkeleton = computed(() => hasRealImages.value && imageLoading.value);
  const showNavigatorsValue = computed(
    () => props.showNavigators ?? props.images.length > 1,
  );

  const responsiveOptions = ref([
    {
      breakpoint: "1400px",
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ]);
</script>

<template>
  <Carousel
    :value="images"
    :num-visible="1"
    :num-scroll="1"
    :responsive-options="responsiveOptions"
    circular
    :show-indicators="true"
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
            :style="{ height }"
            @load="imageLoaded"
            @error="imageError"
          >
          <div
            v-if="showSkeleton"
            :class="$style.skeletonLoader"
            :style="{ height }"
          />
        </template>
        <div
          v-else
          :class="$style.placeholderSlide"
          :style="{ height: props.height }"
        >
          <span>{{ slotProps.data.label ?? "Room Photo" }}</span>
        </div>
      </div>
    </template>

  </Carousel>
</template>

<style module lang="scss">
  .carouselBlock {
    :global {
      .p-carousel {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
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
            top: 0;
            left: rem(30);
            z-index: 1000;
          }

          &.p-carousel-next-button {
            position: absolute;
            top: 0;
            right: rem(30);
            z-index: 1000;
          }
        }
      }

      // Индикаторы
      .p-carousel-indicator-list {
        display: flex;
        justify-content: center;
        gap: rem(8);
        width: 90%;
        margin: 0 auto;
        padding: rem(8) 0;

        .p-carousel-indicator {
          display: flex;
          flex-grow: 1;

          .p-carousel-indicator-button {
            width: 100%;
            border-radius: rem(8);
          }
        }

        .p-carousel-indicator-active {
          .p-carousel-indicator-button {
            background-color: var(--a-text-primary);
          }
        }
      }

      .p-carousel-content-container,
      .p-carousel-items-container,
      .p-carousel-items-content {
        width: 100%;
        padding: 0;
        margin: 0;
      }

      .p-carousel-items-content {
        display: flex;
      }

      .p-carousel-item {
        padding: 0;
      }
    }
  }
  .carouselItem {
    position: relative;
    width: 100%;
  }

  .carouselImage {
    width: 100%;
    object-fit: cover;
    border-radius: rem(8);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.loaded {
      opacity: 1;
    }
  }

  .placeholderSlide {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: rem(8);
    background-color: var(--a-accentLightBg);
    color: var(--a-text-light);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .skeletonLoader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(
      45deg,
      var(--a-lightBg) 25%,
      var(--ui-color-secondary-50) 50%,
      var(--ui-color-secondary-200) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: rem(8);
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  :global(.p-carousel .p-carousel-indicators) {
    padding: rem(8) 0;
  }

  :global(.p-carousel .p-carousel-indicator button) {
    width: rem(8);
    height: rem(8);
    border-radius: 50%;
    background-color: var(--a-text-light);
    opacity: 0.5;
  }

  :global(.p-carousel .p-carousel-indicator.p-highlight button) {
    background-color: var(--a-primary);
    opacity: 1;
  }
</style>
