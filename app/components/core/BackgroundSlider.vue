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
  const timer = ref<NodeJS.Timeout | null>(null);

  const startSlider = () => {
    // Очищаем предыдущий таймер, если он есть
    if (timer.value) {
      clearInterval(timer.value);
    }

    // Запускаем новый таймер только если есть изображения
    if (props.images.length > 0) {
      timer.value = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % props.images.length;
      }, props.interval);
    }
  };

  // Автоматически перезапускаем слайдер при изменении пропсов
  watch(
    () => [props.images, props.interval],
    () => {
      startSlider();
    },
    { immediate: true },
  );

  onMounted(() => {
    isMounted.value = true;
    startSlider();
  });

  onBeforeUnmount(() => {
    if (timer.value) {
      clearInterval(timer.value);
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
          opacity: currentIndex === index ? 1 : 0,
          zIndex: currentIndex === index ? 2 : 0,
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
          opacity: currentIndex === index ? 1 : 0,
          zIndex: currentIndex === index ? 2 : 0,
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
    overflow: hidden;
  }

  .slideImage {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;

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
