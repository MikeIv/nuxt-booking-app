<script setup lang="ts">
  import type { Banner } from "~/types/banner";

  interface Props {
    banners: Banner[];
  }

  const props = defineProps<Props>();

  const validBanners = computed(() => {
    if (!Array.isArray(props.banners)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "BannersList: banners должен быть массивом, получен:",
          typeof props.banners,
          props.banners,
        );
      }
      return [];
    }
    return props.banners.filter((banner) => banner && banner.id && banner.title);
  });
</script>

<template>
  <section
    v-if="validBanners.length > 0"
    :class="$style.wrapper"
    aria-label="Список баннеров"
  >
    <CommonBanner
      v-for="banner in validBanners"
      :key="banner.id"
      :banner="banner"
    />
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    width: 100%;
  }
</style>

