<script setup lang="ts">
  const { isVisible } = useVisibility(500);
</script>

<template>
  <section :class="$style.content">
    <h1 :class="$style.title">
      Многофункциональный гостиничный
      <br />
      комплекс «РОССИЯ»
    </h1>
    <p :class="$style.subtitle">coming soon</p>
    <img
      src="/images/knocker.png"
      srcset="/images/knocker.png 1x, /images/knocker.png 2x"
      alt="узор"
      :class="$style.image"
    />
    <div :class="[$style.textBlock, { [$style.visible]: isVisible }]">
      <p :class="$style.text">гостиница класса люкс</p>
      <p :class="$style.text">премиальный СПА</p>
      <p :class="$style.text">
        апартаменты класса люкс
        <br />
        с видом на Кремль
      </p>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: clamp(8px, 4vw, 20px);
    z-index: z.z("intro");
  }

  .title {
    margin-bottom: rem(40);
    font-family: "Playfair Display", serif;
    font-size: clamp(30px, 4vw, 60px);
    color: var(--a-white);
    text-align: center;
    user-select: none;
  }
  .subtitle {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(14px, 4vw, 20px);
    color: var(--a-white);
    text-align: center;
    letter-spacing: rem(7);
    text-transform: uppercase;
    user-select: none;
  }

  .image {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(30) 0;
    width: rem(50);
    height: rem(50);
    object-fit: contain;
  }

  .textBlock {
    display: grid;
    gap: rem(20);
    align-items: center;
    justify-items: center;
    grid-auto-flow: row;
    width: 100%;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.8s ease-out,
      transform 0.6s ease-out;
  }

  @media (min-width: #{size.$tabletMax}) {
    .textBlock {
      grid-auto-flow: column;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      margin-top: rem(80);
    }
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: rem(16);
    color: var(--a-white);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: rem(4);
    user-select: none;
  }

  .visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
