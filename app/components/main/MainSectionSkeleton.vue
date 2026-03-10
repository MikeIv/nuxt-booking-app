<script setup lang="ts">
  interface Props {
    title?: string;
  }

  defineProps<Props>();
</script>

<template>
  <section :class="$style.wrapper" aria-busy="true" aria-live="polite">
    <div v-if="title" :class="$style.header">
      <div :class="$style.titleSkeleton">
        <span :class="$style.titleText">
          {{ title }}
        </span>
      </div>
    </div>
    <div :class="$style.content">
      <div :class="$style.line" />
      <div :class="$style.line" />
      <div :class="$style.block" />
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .wrapper {
    width: 100%;
    max-width: size.$desktop;
    margin: 0 auto;
    padding: rem(24) rem(16);

    @media (min-width: #{size.$tablet}) {
      padding: rem(32) rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(40) rem(32);
    }
  }

  .header {
    margin-bottom: rem(16);
  }

  .titleSkeleton {
    display: inline-flex;
    align-items: center;
    min-width: rem(140);
    padding: rem(6) rem(12);
    border-radius: var(--a-borderR--btn);
    background: linear-gradient(
      90deg,
      var(--ui-color-primary-50) 25%,
      var(--a-border-light) 50%,
      var(--ui-color-primary-50) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  .titleText {
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-light);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  .line {
    width: 100%;
    height: rem(14);
    border-radius: var(--a-borderR--btn);
    background: linear-gradient(
      90deg,
      var(--ui-color-primary-50) 25%,
      var(--a-border-light) 50%,
      var(--ui-color-primary-50) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  .block {
    width: 100%;
    height: rem(160);
    margin-top: rem(8);
    border-radius: var(--a-borderR--x30);
    background: linear-gradient(
      90deg,
      var(--ui-color-primary-50) 25%,
      var(--a-border-light) 50%,
      var(--ui-color-primary-50) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;

    @media (min-width: #{size.$tablet}) {
      height: rem(200);
    }

    @media (min-width: #{size.$desktopMin}) {
      height: rem(240);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>

