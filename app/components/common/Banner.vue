<script setup lang="ts">
  import type { Banner } from "~/types/banner";

  interface Props {
    banner: Banner;
  }

  const props = defineProps<Props>();

  const BANNER_TYPE_MAP: Record<Banner["type"], string> = {
    alert: "alert",
    info: "info",
    warning: "warning",
  } as const;

  const bannerBgClass = computed(() => {
    return BANNER_TYPE_MAP[props.banner.type] || "alert";
  });
</script>

<template>
  <article
    :class="[$style.banner, $style[bannerBgClass]]"
    :aria-label="`Баннер: ${banner.title}`"
  >
    <UIcon name="i-inform-circle" :class="$style.icon" aria-hidden="true" />
    <div :class="$style.content">
      <p :class="$style.title">{{ banner.title }}</p>
      <p v-if="banner.description" :class="$style.description">
        {{ banner.description }}
      </p>
    </div>
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/tools/functions" as *;

  .banner {
    display: flex;
    align-items: flex-start;
    gap: rem(12);
    width: 100%;
    padding: rem(16) rem(20);
    border-radius: var(--p-banner-border-radius);

    @media (min-width: #{size.$tablet}) {
      padding: rem(20) rem(24);
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(24) rem(32);
    }
  }

  .icon {
    flex-shrink: 0;
    width: rem(20);
    height: rem(20);
    margin-top: rem(2);

    @media (min-width: #{size.$tablet}) {
      width: rem(24);
      height: rem(24);
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .title {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    line-height: 1.5;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .description {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: rem(13);
    font-weight: 400;
    line-height: 1.5;
    color: var(--a-text-dark);
    opacity: 0.8;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(14);
    }
  }

  .alert {
    background-color: var(--a-banner-alert-bg);
  }

  .info {
    background-color: var(--a-banner-info-bg);
  }

  .warning {
    background-color: var(--a-banner-warning-bg);
  }
</style>

