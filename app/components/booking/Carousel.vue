<script setup lang="ts">
  import Carousel from "primevue/carousel";

  interface Props {
    images: string[];
    altPrefix: string;
    altText: string;
    height?: string;
    emptyImage?: string;
    showNavigators?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: "auto",
    emptyImage: "/images/room/room-01.jpg",
    showNavigators: undefined,
  });

  const imageLoading = ref(true);

  const imageLoaded = () => {
    imageLoading.value = false;
  };

  const imageError = () => {
    imageLoading.value = false;
  };

  watch(
    () => props.images,
    () => {
      imageLoading.value = true;
    },
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
    :show-navigators="showNavigators ?? images?.length > 1"
    :class="$style.carouselBlock"
  >
    <template #item="slotProps">
      <div :class="[$style.carouselItem]">
        <img
          :src="slotProps.data"
          :alt="`${altPrefix} ${altText}`"
          :class="[$style.carouselImage, { [$style.loaded]: !imageLoading }]"
          :style="{ height: props.height }"
          @load="imageLoaded"
          @error="imageError"
        />
        <div
          v-if="imageLoading"
          :class="$style.skeletonLoader"
          :style="{ height }"
        />
      </div>
    </template>

    <template #empty>
      <div :class="[$style.emptyCarousel, { [$style.customHeight]: height }]">
        <img
          :src="emptyImage"
          :alt="altText"
          :class="$style.carouselImage"
          :style="{ height }"
        />
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
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;

        .p-button-text.p-button-secondary {
          color: var(--a-text-primary);

          &:hover {
            color: var(--a-text-dark);
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
    }
  }
  .carouselItem {
    position: relative;
    width: 100%;
  }

  .customHeight {
    height: auto;
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

  .emptyCarousel {
    width: 100%;
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
