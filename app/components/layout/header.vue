<script setup lang="ts"></script>

<template>
  <section :class="$style.section">
    <LayoutAside />
  </section>
</template>

<style module lang="scss">
  .section {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 1920px;
    overflow: hidden;
  }
</style>
