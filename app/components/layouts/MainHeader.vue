<script setup lang="ts">

</script>

<template>
  <section :class="$style.section">
    <aside :class="$style.aside">
      <h1 :class="$style.title">Заголовок на главной</h1>
    </aside>

  </section>
</template>

<style module lang="scss">
@use "~/assets/styles/tools/mixins" as mix;
.section {
  position: relative;
  max-width: 1920px;
  margin: auto;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.aside {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: rem(16);
  z-index: 9999;
  background-color: var(--a-mainBg);
  font-size: rem(12);


}
.title{
  font-size: rem(16);

  @include mix.tablet {
    font-size: rem(18);
  }
  @include mix.tabletMax {
    font-size: rem(24);
  }
  @include mix.desktop {
    font-size: rem(32);
  }
}
</style>