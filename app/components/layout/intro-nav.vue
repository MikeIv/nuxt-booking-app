<script setup lang="ts">
  const { desktopImages, mobileImages, loadImages } = useBackgroundSlider();

  await loadImages();
</script>

<template>
  <section :class="$style.introNav">
    <CoreBackgroundSlider
      :images="desktopImages"
      :mobile-images="mobileImages"
    />

    <div :class="$style.content">
      <HeaderIntroBlock />
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .introNav {
    position: relative;
    width: 100%;
    height: 100vh;
    margin-top: clamp(60px, 8vw, 95px);
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
