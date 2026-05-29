<script setup lang="ts">
import {
  filterSelectOptions,
  normalizeSelectOptions,
  type SelectOption,
} from "~/utils/selectOptions";

interface Props {
  modelValue: string;
  options: SelectOption[] | string[];
  placeholder: string;
  ariaLabel?: string;
  invalid?: boolean;
  disabled?: boolean;
  variant?: "default" | "booking" | "personal";
  searchable?: boolean;
  searchPlaceholder?: string;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: "",
  invalid: false,
  disabled: false,
  variant: "personal",
  searchable: false,
  searchPlaceholder: "Поиск...",
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");

const normalizedOptions = computed(() => normalizeSelectOptions(props.options));

const filteredOptions = computed(() =>
  props.searchable
    ? filterSelectOptions(normalizedOptions.value, searchQuery.value)
    : normalizedOptions.value,
);

const selectedLabel = computed(
  () =>
    normalizedOptions.value.find((option) => option.value === props.modelValue)
      ?.label ?? "",
);

const close = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const open = async () => {
  isOpen.value = true;
  if (!props.searchable) return;
  await nextTick();
  searchInputRef.value?.focus();
};

const toggleOpen = () => {
  if (props.disabled) return;
  if (isOpen.value) {
    close();
    return;
  }
  void open();
};

const selectValue = (value: string) => {
  emit("update:modelValue", value);
  close();
};

const onSearchKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const firstOption = filteredOptions.value[0];
  if (firstOption) selectValue(firstOption.value);
};

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!rootRef.value?.contains(target)) close();
};

const onEsc = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) close();
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

    <div v-if="isOpen" :class="$style.menu" @click.stop>
      <div v-if="searchable" :class="$style.searchContainer">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          :class="$style.searchInput"
          type="search"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          @keydown="onSearchKeydown"
          @click.stop
        >
      </div>
      <div :class="$style.optionsList">
        <button
          v-for="option in filteredOptions"
          :key="option.value"
          type="button"
          :class="[
            $style.option,
            option.value === modelValue && $style.option_active,
          ]"
          @click.stop="selectValue(option.value)"
        >
          {{ option.label }}
        </button>
        <p
          v-if="searchable && filteredOptions.length === 0"
          :class="$style.noResults"
        >
          Ничего не найдено
        </p>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .root {
    position: relative;
    width: 100%;
  }

  .menu {
    position: absolute;
    z-index: z.z("dropdown");
    top: calc(100% + rem(8));
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: rem(1) solid var(--a-border-dark);
    border-radius: rem(16);
    background: var(--a-whiteBg);
    box-shadow: var(--a-shadow-summary);
  }

  .searchContainer {
    padding: rem(8);
    border-bottom: rem(1) solid var(--a-border-dark);
    flex-shrink: 0;
  }

  .searchInput {
    width: 100%;
    height: rem(40);
    padding: 0 rem(12);
    border: rem(1) solid var(--a-border-dark);
    border-radius: rem(12);
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
    outline: none;

    &:focus {
      border-color: var(--a-border-primary-accent);
    }

    &::placeholder {
      color: var(--a-text-dark);
      opacity: 0.3;
    }
  }

  .optionsList {
    display: flex;
    flex-direction: column;
    max-height: rem(240);
    overflow: auto;
    padding: rem(8);
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

  .noResults {
    margin: 0;
    padding: rem(10) rem(12);
    text-align: center;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-light);
  }
</style>
