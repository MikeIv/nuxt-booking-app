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
  <div :class="[$style.selectBlock, error ? $style.hasError : '']">
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
    position: relative;
  }

  .hasError {
    :global {
      .p-select {
        border-color: var(--a-border-accent);
      }
    }
  }

  .select {
    position: relative;
  }
  .errorText {
    display: block;
    margin-top: rem(4);
    color: var(--a-text-accent);
    font-size: rem(12);
    line-height: 1.2;
  }
</style>
