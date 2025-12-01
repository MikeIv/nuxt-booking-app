<script setup lang="ts">
interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: Infinity,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function updateValue(delta: number) {
  if (props.disabled) return;
  const newValue = props.modelValue + delta;
  if (newValue >= props.min && newValue <= props.max) {
    emit("update:modelValue", newValue);
  }
}

const canDecrease = computed(() => props.modelValue > props.min && !props.disabled);
const canIncrease = computed(() => props.modelValue < props.max && !props.disabled);
</script>

<template>
  <div :class="$style.counter">
    <Button
      type="button"
      unstyled
      :class="$style.setButton"
      :disabled="!canDecrease"
      @click="updateValue(-1)"
    >
      -
    </Button>
    <span :class="$style.count">{{ modelValue }}</span>
    <Button
      type="button"
      unstyled
      :class="$style.setButton"
      :disabled="!canIncrease"
      @click="updateValue(1)"
    >
      +
    </Button>
  </div>
</template>

<style module lang="scss">
.counter {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: rem(124);
  margin-left: rem(20);
}

.setButton {
  display: flex;
  justify-content: center;
  align-items: center;
  width: rem(34);
  height: rem(34);
  font-size: rem(24);
  color: var(--a-white);
  background-color: var(--a-accentLightBg);
  border-radius: 50%;
  cursor: pointer;
  border: none;

  &:hover {
    background-color: var(--a-accentBg);
  }

  &:disabled {
    background-color: var(--a-accentLightBg);
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: none;
    background-color: var(--a-accentBg);
  }
}

.count {
  display: flex;
  justify-content: center;
  align-items: center;
  width: rem(40);
  height: rem(40);
  font-size: rem(24);
  color: var(--a-black);
}
</style>

