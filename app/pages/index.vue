<script setup lang="ts">
  definePageMeta({
    layout: "main",
  });
</script>

<template>
  <div :class="$style.main">
    <PagesMainIntro />
    <!-- Блоки с якорями -->
    <PagesMainAccommodation anchor-id="accommodation" />
    <PagesMainRestaurants anchor-id="restaurants" />
    <PagesMainEvents anchor-id="events" />
    <PagesMainSpa anchor-id="spa" />
    <PagesMainEntertainment anchor-id="entertainment" />
    <PagesMainConstruction anchor-id="construction" />
  </div>
</template>

<style module lang="scss">
  .main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
  }
</style>
