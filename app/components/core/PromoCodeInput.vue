<script setup lang="ts">
  defineProps({
    modelValue: {
      type: String,
      default: "",
    },
    placeholderText: {
      type: String,
      default: "Специальный код",
    },
  });

  const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div :class="$style.inputWrapper">
    <input
      :value="modelValue"
      :class="$style.customInput"
      placeholder=" "
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    >
    <span :class="$style.label">{{ placeholderText }}</span>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .inputWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: rem(4);

    @media (min-width: #{size.$desktopMin}) {
      width: calc(50% - rem(12));
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: auto;
      min-width: rem(280);
    }
  }

  .customInput {
    width: 100%;
    height: rem(67);
    padding: rem(22) rem(36) rem(2) rem(12);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-black);
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: rem(16);

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .label {
    position: absolute;
    top: rem(8);
    left: rem(8);
    font-size: rem(12);
    font-weight: 400;
    font-family: Inter, sans-serif;
    color: var(--a-text-light);
    margin-left: rem(12);
    z-index: z.z("booking-label");
  }
</style>
