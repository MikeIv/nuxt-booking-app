<script setup lang="ts">
  const knocker = new URL("~/assets/images/knocker.png", import.meta.url).href;
</script>

<template>
  <section :class="$style.content">
    <h1 :class="$style.title">
      Многофункциональный гостиничный <br />комплекс «РОССИЯ»
    </h1>
    <p :class="$style.subtitle">coming soon</p>
    <NuxtImg :src="knocker" alt="узор" :class="$style.image" />
    <div :class="$style.textBlock">
      <p :class="$style.text">гостиница класса люкс</p>
      <p :class="$style.text">премиальный СПА</p>
      <p :class="$style.text">
        апартаменты класса люкс <br />с видом на Кремль
      </p>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

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
  }
  .subtitle {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(14px, 4vw, 20px);
    color: var(--a-white);
    text-align: center;
    letter-spacing: rem(7);
    text-transform: uppercase;
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: rem(20);
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: rem(16);
    color: var(--a-white);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: rem(4);
  }
</style>
