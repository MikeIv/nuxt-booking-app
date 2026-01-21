<script setup lang="ts">
  defineProps<{
    id: string;
    displayValue: string;
    placeholder: string;
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    toggle: [];
  }>();
</script>

<template>
  <div :class="$style.datepickerContainer">
    <label :class="$style.periodLabel" :for="`${id}-input`">
      <slot name="label" />
    </label>
    <button
      :id="`${id}-input`"
      type="button"
      :class="$style.datepickerInput"
      :aria-label="displayValue || placeholder"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="`${id}-popup`"
      @click="emit('toggle')"
    >
      <div :class="$style.dateDisplay">
        <slot name="display" />
      </div>
      <UIcon name="i-calendar" :class="$style.calendarIcon" aria-hidden="true" />
    </button>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .datepickerContainer {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .periodLabel {
    position: absolute;
    top: rem(8);
    left: rem(50);
    font-size: rem(12);
    font-weight: 400;
    font-family: Inter, sans-serif;
    color: var(--a-text-light);
    margin-left: rem(12);
    z-index: z.z("booking-label");
    cursor: pointer;
  }

  .datepickerInput {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: rem(67);
    padding: rem(22) rem(36) rem(2) rem(12);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    border: none;
    border-radius: rem(16);
    background-color: var(--a-white);
    cursor: pointer;
    text-align: left;

    @media (min-width: #{size.$desktopMedium}) {
      width: auto;
      min-width: rem(340);
    }

    &:hover {
      border-color: var(--a-border-accent);
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid var(--a-primaryBg);
      outline-offset: 2px;
    }
  }

  .dateDisplay {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }

  .calendarIcon {
    position: absolute;
    right: rem(12);
    top: 50%;
    transform: translateY(-50%);
    color: var(--a-text-light);
    width: rem(30);
    height: rem(30);
  }
</style>

