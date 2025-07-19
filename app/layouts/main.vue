<template>
  <div :class="$style.layout">
    <LayoutsMainHeader />
    <slot />
    <LayoutsFooter />
  </div>
</template>
<script setup lang="ts">
</script>
<style module lang="scss">
.layout {
  display: grid;
}
</style>