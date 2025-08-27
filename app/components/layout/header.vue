<script setup lang="ts"></script>

<template>
  <section :class="$style.section">
    <LayoutAside />
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .section {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    margin: 0 auto;
    overflow: hidden;
  }
</style>
