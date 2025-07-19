<script setup lang="ts">

</script>

<template>
  <section :class="$style.section">
    <LayoutAside />
  </section>
</template>

<style module lang="scss">
.section {
  position: relative;
  max-width: 1920px;
  margin: auto;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>