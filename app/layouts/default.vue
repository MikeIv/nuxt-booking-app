<template>
  <div :class="$style.layout">
    <LayoutHeader />
    <div :class="$style.wrapper">
      <CoreBreadcrumbs />
      <slot />
    </div>
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts"></script>

<style module lang="scss">
  .layout {
    display: grid;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: clamp(60px, 8vw, 95px);
    background-color: var(--a-whiteBg);
  }
</style>
