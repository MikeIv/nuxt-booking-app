<script setup lang="ts">
  interface FooterProps {
    canSelect: boolean;
    displayValue: string;
    cancelLabel: string;
    selectLabel: string;
  }

  const props = defineProps<FooterProps>();

  const emit = defineEmits<{
    cancel: [];
    select: [];
  }>();

  const selectButtonAriaLabel = computed(() =>
    props.canSelect
      ? `Выбрать даты: ${props.displayValue}`
      : 'Выберите даты заезда и выезда'
  );
</script>

<template>
  <div :class="$style.calendarFooter" role="group" aria-label="Действия с календарем">
    <CoreCalendarFooterButton
      variant="cancel"
      :label="props.cancelLabel"
      :aria-label="'Отменить выбор'"
      @click="emit('cancel')"
    />
    <CoreCalendarFooterButton
      variant="select"
      :label="props.selectLabel"
      :aria-label="selectButtonAriaLabel"
      :disabled="!props.canSelect"
      @click="emit('select')"
    />
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .calendarFooter {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: rem(8);
    margin-top: rem(6);
    padding-top: rem(6);
    border-top: 1px solid var(--a-border-accent);

    @media (min-width: #{size.$tablet}) {
      gap: rem(12);
      margin-top: rem(8);
      padding-top: rem(8);
    }
  }
</style>
