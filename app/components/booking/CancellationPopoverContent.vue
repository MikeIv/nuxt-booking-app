<script setup lang="ts">
  interface Props {
    /** Заголовок popover */
    title?: string;
    /** Текст описания */
    description?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "Бесплатная отмена",
    description:
      "Вы можете бесплатно отменить бронирование до определенной даты. При отмене после указанного срока может взиматься штраф. Подробные условия отмены уточняйте при бронировании или в описании тарифа.",
  });
</script>

<template>
  <div :class="$style.cancellationPopup">
    <h4 :class="$style.cancellationTitle">{{ props.title }}</h4>
    <p :class="$style.cancellationDescription">{{ props.description }}</p>
  </div>
</template>

<style module lang="scss">
  .cancellationPopup {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    min-width: rem(280);
  }

  .cancellationTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .cancellationDescription {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    margin: 0;
    line-height: 1.5;
  }
</style>
