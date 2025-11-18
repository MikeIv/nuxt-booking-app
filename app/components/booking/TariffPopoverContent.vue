<script setup lang="ts">
  // Переиспользуемый компонент для содержимого popover тарифа
  // Используется для избежания дублирования кода
</script>

<template>
  <div :class="$style.detailsPopup">
    <div :class="$style.detailsRow">Краткое описание тарифа.</div>
    <div :class="$style.detailsRow">Условия и ограничения применяются.</div>
    <div :class="$style.detailsRow">
      Подробности уточняйте при бронировании.
    </div>
  </div>
</template>

<style module lang="scss">
  .detailsPopup {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    min-width: rem(220);
  }

  .detailsRow {
    display: flex;
    justify-content: space-between;
    gap: rem(10);
    font-family: Inter, sans-serif;
    font-size: rem(14);
  }
</style>
