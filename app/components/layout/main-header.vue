<script setup lang="ts"></script>

<template>
  <section :class="$style.section">
    <LayoutAside />
    <LayoutIntroNav />
  </section>
</template>

<style module lang="scss">
  .section {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
