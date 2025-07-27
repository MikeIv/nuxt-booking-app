<script setup lang="ts"></script>

<template>
  <LayoutContentBlock
    :has-two-columns="true"
    :layout-class="$style.intro"
    :column-left="$style.introLeft"
  >
    <template #left-column>
      <h2>Welcom</h2>
    </template>

    <template #right-column>
      <div>Сайдбар...</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  .intro {
    display: flex;
    width: 100%;
    min-height: rem(200);
    background-image: url("/images/welcome.png");
    background-repeat: no-repeat;
    background-position: left top;
    background-size: contain;
  }
  .introLeft {
    height: 100%;
    background-color: var(--a-mainBg);
  }
</style>
