<script setup lang="ts">

</script>

<template>
  <section :class="$style.introNav">
    Навигация на главной
  </section>
</template>

<style module lang="scss">
.introNav {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 95px);
  margin-top: clamp(60px, 8vw, 95px);
  background-size: cover;
  background-color: var(--a-btnAccentBg);
  -webkit-animation: opacity 3s ease-out forwards;
  animation: opacity 3s ease-out forwards;
}
</style>
