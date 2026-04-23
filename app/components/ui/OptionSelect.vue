<script setup lang="ts">
interface OptionItem {
  label: string;
  value: string;
}

interface Props {
  modelValue: string;
  options: OptionItem[] | string[];
  placeholder: string;
  ariaLabel?: string;
  invalid?: boolean;
  disabled?: boolean;
  variant?: "default" | "booking" | "personal";
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: "",
  invalid: false,
  disabled: false,
  variant: "personal",
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const normalizedOptions = computed<OptionItem[]>(() =>
  props.options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  ),
);

const selectedLabel = computed(() => {
  const selected = normalizedOptions.value.find(
    (option) => option.value === props.modelValue,
  );
  return selected?.label ?? "";
});

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const selectValue = (value: string) => {
  emit("update:modelValue", value);
  close();
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!rootRef.value?.contains(target)) {
    close();
  }
};

const onEsc = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onEsc);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEsc);
});
</script>

<template>
  <div ref="rootRef" :class="$style.root">
    <UiSelect
      :value-text="selectedLabel"
      :placeholder="placeholder"
      icon-name="i-chevron-down-select"
      :variant="variant"
      :open="isOpen"
      :invalid="invalid"
      :disabled="disabled"
      :aria-label="ariaLabel || placeholder"
      @click.stop="toggleOpen"
    />

    <div v-if="isOpen" :class="$style.menu">
      <button
        v-for="option in normalizedOptions"
        :key="option.value"
        type="button"
        :class="[
          $style.option,
          option.value === props.modelValue && $style.option_active,
        ]"
        @click.stop="selectValue(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
  .root {
    position: relative;
    width: 100%;
  }

  .menu {
    position: absolute;
    z-index: 10;
    top: calc(100% + rem(8));
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    max-height: rem(240);
    overflow: auto;
    padding: rem(8);
    border: rem(1) solid var(--a-border-dark);
    border-radius: rem(16);
    background: var(--a-whiteBg);
    box-shadow: var(--a-shadow-summary);
  }

  .option {
    width: 100%;
    padding: rem(10) rem(12);
    border: 0;
    border-radius: rem(10);
    text-align: left;
    background: transparent;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);
    cursor: pointer;

    &:hover {
      background: var(--a-mainBg);
    }
  }

  .option_active {
    background: var(--a-mainBg);
  }
</style>
