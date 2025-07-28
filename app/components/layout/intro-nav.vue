<script setup lang="ts">
  const { useImages } = useImageLoader();
  const desktopImages = useImages("images/intro/bg-slider");
  const mobileImages = useImages("images/intro/bg-slider/mob");
  console.log("desktopImages", desktopImages);
</script>

<template>
  <section :class="$style.introNav">
    <CoreBackgroundSlider
      :images="desktopImages"
      :mobile-images="mobileImages"
    />

    <div :class="$style.content">
      <HeaderNavBlock />
      <HeaderIntroBlock />
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;
  @use "~/assets/styles/variables/resolutions" as size;

  .introNav {
    position: relative;
    width: 100%;
    height: 100vh;
    margin-top: clamp(60px, 8vw, 95px);
    padding: clamp(12px, 4vw, 30px);
    overflow: hidden;
  }

  .content {
    position: relative;
    z-index: z.z("intro");
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
