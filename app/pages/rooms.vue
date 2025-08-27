<script setup lang="ts"></script>

<template>
  <div>
    <h1 :class="$style.header">Выбор номера 1</h1>
    <Booking />
  </div>
</template>

<style module lang="scss">
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }
</style>
