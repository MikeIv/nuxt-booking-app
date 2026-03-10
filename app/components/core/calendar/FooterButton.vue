<script setup lang="ts">
  type Variant = 'cancel' | 'select';

  const props = withDefaults(
    defineProps<{
      variant: Variant;
      label: string;
      /** Соответствует атрибуту aria-label на кнопке */
      ariaLabel: string;
      disabled?: boolean;
    }>(),
    { disabled: false }
  );

  const emit = defineEmits<{ click: [] }>();

  const isCancel = computed(() => props.variant === 'cancel');
</script>

<template>
  <button
    type="button"
    :class="[
      $style.footerButton,
      isCancel ? $style.footerButtonCancel : $style.footerButtonSelect,
    ]"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .footerButton {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(32);
    padding: rem(6) rem(10);
    border: none;
    border-radius: var(--a-borderR--x6);
    font-size: rem(12);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    @media (min-width: #{size.$tablet}) {
      min-height: rem(28);
      padding: rem(8) rem(12);
      border-radius: var(--a-borderR--x8);
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
