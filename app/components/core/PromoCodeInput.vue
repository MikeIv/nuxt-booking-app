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
    <UiInput
      :model-value="modelValue"
      :label="placeholderText"
      placeholder=""
      variant="booking"
      :class="$style.uiInput"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

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

  .uiInput {
    width: 100%;
  }
</style>
