<script setup lang="ts">
  const props = defineProps<{
    id: string;
    label: string;
    displayValue: string;
    placeholder: string;
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    toggle: [];
  }>();

  const valueText = computed(() => props.displayValue || props.placeholder);
</script>

<template>
  <div :class="$style.datepickerContainer">
    <UiSelect
      :id="`${id}-input`"
      :class="$style.datepickerInput"
      variant="booking"
      :label="label"
      :value-text="valueText"
      icon-name="i-calendar"
      :open="isOpen"
      :rotate-icon-on-open="false"
      :aria-label="valueText"
      :aria-haspopup="true"
      :aria-controls="`${id}-popup`"
      @click="emit('toggle')"
    />
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .datepickerContainer {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .datepickerInput {
    width: 100%;

    @media (min-width: #{size.$desktopMedium}) {
      width: auto;
      min-width: rem(340);
    }
  }
</style>

