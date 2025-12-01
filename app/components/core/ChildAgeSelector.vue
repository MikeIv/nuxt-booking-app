<script setup lang="ts">
import { getAgeOptions, childAgeLabel } from "~/utils/age";

interface Props {
  modelValue: number;
  totalChildren: number;
  childIndex: number; // 1-based index
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const ageOptions = computed(() => getAgeOptions());
const label = computed(() => childAgeLabel(props.totalChildren, props.childIndex));
</script>

<template>
  <div :class="$style.childAgeRow">
    <span :class="$style.name">{{ label }}</span>
    <div :class="$style.selectBlock">
      <Select
        :class="$style.ageSelect"
        :model-value="modelValue"
        :options="ageOptions"
        option-label="label"
        option-value="value"
        placeholder="Возраст"
        :pt="{
          root: { class: $style.ageSelect },
          item: { class: $style.ageOption },
          panel: { class: $style.selectPanel },
        }"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.childAgeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  font-family: "Inter", sans-serif;
  font-size: rem(18);
  color: var(--a-text-dark);
  text-wrap: wrap;

  @media (min-width: #{size.$desktopMin}) {
    font-size: rem(22);
  }
}

.selectBlock {
  display: flex;
  align-items: center;

  :global {
    .p-select {
      display: flex;
      align-items: center;
      padding: 0 rem(16);
      font-size: rem(16);
      color: var(--a-text-dark);
      background-color: var(--a-whiteBg);
      border-radius: var(--a-borderR--input);
      transition: border-color 0.3s ease;
      border: rem(1) solid var(--a-border-primary);
    }

    .p-select-label.p-placeholder {
      color: var(--a-text-light);
    }
  }
}

.ageSelect {
  width: rem(120);
  height: rem(36);
  font-size: rem(16);
  font-family: "Inter", sans-serif;
  background-color: var(--a-whiteBg);
  border: rem(1) solid var(--a-border-primary);
  border-radius: var(--a-borderR--input);
  color: var(--a-text-dark);
  cursor: pointer;

  @media (min-width: #{size.$desktopMin}) {
    width: rem(148);
  }

  &:focus {
    outline: none;
    border-color: var(--a-accentBg);
  }
}

.ageOption {
  padding: rem(8);
  font-family: "Inter", sans-serif;
  font-size: rem(16);
}
</style>

