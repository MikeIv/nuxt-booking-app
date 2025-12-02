<script setup lang="ts">
  defineProps<{
    canSelect: boolean;
    displayValue: string;
    cancelLabel: string;
    selectLabel: string;
  }>();

  const emit = defineEmits<{
    cancel: [];
    select: [];
  }>();
</script>

<template>
  <div :class="$style.calendarFooter" role="group" aria-label="Действия с календарем">
    <button
      type="button"
      :class="[$style.footerButton, $style.footerButtonCancel]"
      aria-label="Отменить выбор"
      @click="emit('cancel')"
    >
      {{ cancelLabel }}
    </button>
    <button
      type="button"
      :class="[$style.footerButton, $style.footerButtonSelect]"
      :disabled="!canSelect"
      :aria-label="canSelect ? `Выбрать даты: ${displayValue}` : 'Выберите даты заезда и выезда'"
      @click="emit('select')"
    >
      {{ selectLabel }}
    </button>
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

  .footerButton {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(32);
    padding: rem(6) rem(10);
    border: none;
    border-radius: rem(6);
    font-size: rem(12);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    @media (min-width: #{size.$tablet}) {
      min-height: rem(28);
      padding: rem(8) rem(12);
      border-radius: rem(8);
      font-size: inherit;
    }
  }

  .footerButtonCancel {
    color: var(--ui-color-secondary-950);
    background-color: var(--ui-color-secondary-200);

    &:hover {
      color: var(--a-white);
      background-color: var(--ui-color-secondary-500);
    }
  }

  .footerButtonSelect {
    color: var(--a-white);
    background-color: var(--primary);

    &:hover:not(:disabled) {
      background-color: var(--ui-color-primary-600);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>

