<template>
  <div :class="$style.layout">
    <LayoutMainHeader />
    <slot />
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts"></script>

<style module lang="scss">
  .layout {
    display: grid;
  }
</style>
