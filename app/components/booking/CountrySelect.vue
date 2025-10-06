<script setup lang="ts">
  import { countriesRu } from "~/utils/countries";

  defineProps<{
    modelValue: string;
    error?: string | null;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [string];
  }>();
</script>

<template>
  <div :class="$style.selectBlock">
    <Select
      :model-value="modelValue"
      :options="countriesRu"
      placeholder="Выберите страну"
      :class="$style.select"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <small v-if="error" :class="$style.errorText">{{ error }}</small>
  </div>
</template>

<style module lang="scss">
  .selectBlock {
    :global {
      .p-select {
        padding: 0 rem(16);
        font-size: rem(16);
        background-color: var(--a-whiteBg);
        border-radius: var(--a-borderR--input);
        transition: border-color 0.3s ease;
        color: var(--a-text-dark);
        border: rem(1) solid var(--a-border-dark);
      }

      .p-select-label.p-placeholder {
        color: var(--a-text-light);
      }
    }
  }
  .select {
    display: flex;
    align-items: center;
    width: 100%;
    height: rem(58);

    &:placeholder {
      color: var(--a-text-light);
    }

    &:focus {
      outline: none;
      border-color: var(--a-accentBg);
    }

    &.selectError {
      border-color: var(--a-border-accent);
    }
  }
  .errorText {
    display: block;
    margin-top: rem(4);
    color: var(--a-text-accent);
    font-size: rem(12);
    line-height: 1.2;
  }
</style>
