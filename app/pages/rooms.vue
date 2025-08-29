<script setup lang="ts">
  const items = ref(["Backlog", "Todo", "In Progress", "Done"]);
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номера 1</h1>
    <Booking />
    <div>
      <UInputMenu
        :items="items"
        placeholder="Тип кровати"
        :class="$style.input"
        class="rooms-filter"
      />
    </div>
  </div>
</template>

<style module lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);
  }
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
  .input {
    border: 1px solid var(--a-accentBg);
    border-radius: rem(8);

    & input .bg-default {
      background: var(--a-accentBg);
    }
  }
</style>

<style lang="scss">
  .rooms-filter input {
    background-color: var(--a-btnAccentBg);
    & .bg-default {
      background: var(--a-accentBg);
    }
  }
</style>
