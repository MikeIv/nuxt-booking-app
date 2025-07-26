<script setup lang="ts">
  const props = defineProps({
    images: {
      type: Array as () => string[],
      required: true,
    },
    mobileImages: {
      type: Array as () => string[],
      required: true,
    },
    interval: {
      type: Number,
      default: 5000,
    },
  });

  const currentIndex = ref(0);
  const isMounted = ref(false);

  const startSlider = () => {
    const timer = setInterval(() => {
      currentIndex.value =
        (currentIndex.value + 1) % Math.max(1, props.images.length);
    }, props.interval);

    onBeforeUnmount(() => clearInterval(timer));
  };

  onMounted(() => {
    isMounted.value = true;
    if (props.images.length > 0) {
      startSlider();
    }
  });
</script>

<template>
  <section :class="$style.sliderContainer">
    <!-- Десктопные изображения -->
    <template v-for="(image, index) in props.images" :key="`desktop-${index}`">
      <img
        v-show="isMounted && image"
        :src="image"
        :class="[$style.slideImage, $style.desktopImage]"
        :style="{
          opacity:
            currentIndex === index
              ? 1
              : currentIndex - 1 === index ||
                  (currentIndex === 0 && index === props.images.length - 1)
                ? 0.5
                : 0,
          zIndex:
            currentIndex === index
              ? 2
              : currentIndex - 1 === index ||
                  (currentIndex === 0 && index === props.images.length - 1)
                ? 1
                : 0,
          transition: 'opacity 1.5s ease-in-out',
        }"
        :alt="`Slide ${index + 1}`"
        loading="lazy"
      />
    </template>

    <!-- Мобильные изображения -->
    <template
      v-for="(image, index) in props.mobileImages"
      :key="`mobile-${index}`"
    >
      <img
        v-show="isMounted && image"
        :src="image"
        :class="[$style.slideImage, $style.mobileImage]"
        :style="{
          opacity:
            currentIndex === index
              ? 1
              : currentIndex - 1 === index ||
                  (currentIndex === 0 &&
                    index === props.mobileImages.length - 1)
                ? 0.5
                : 0,
          zIndex:
            currentIndex === index
              ? 2
              : currentIndex - 1 === index ||
                  (currentIndex === 0 &&
                    index === props.mobileImages.length - 1)
                ? 1
                : 0,
          transition: 'opacity 1.5s ease-in-out',
        }"
        :alt="`Slide ${index + 1}`"
        loading="lazy"
      />
    </template>
  </section>
</template>

<style module lang="scss">
  .sliderContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .slideImage {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;

    &.desktopImage {
      display: block;
      @media (max-width: 768px) {
        display: none;
      }
    }

    &.mobileImage {
      display: none;
      @media (max-width: 768px) {
        display: block;
      }
    }
  }
</style>
