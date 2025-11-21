<script setup lang="ts">
  import { countriesRu } from "~/utils/countries";
  import {
    useCssModule,
    ref,
    computed,
    onMounted,
    onUnmounted,
    nextTick,
  } from "vue";

  const props = defineProps<{
    modelValue: string;
    error?: string | null;
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [string];
  }>();

  const $style = useCssModule();
  const isOpen = ref(false);
  const selectRef = ref<HTMLElement | null>(null);
  const dropdownRef = ref<HTMLElement | null>(null);
  const searchInputRef = ref<HTMLInputElement | null>(null);
  const dropdownPosition = ref({ top: 0, left: 0, width: 0 });
  const searchQuery = ref("");

  const selectedCountry = computed(() => {
    return props.modelValue || "";
  });

  const displayValue = computed(() => {
    return props.modelValue || props.placeholder || "Выберите страну";
  });

  const filteredCountries = computed(() => {
    if (!searchQuery.value.trim()) {
      return countriesRu;
    }
    const query = searchQuery.value.toLowerCase().trim();
    return countriesRu.filter((country) =>
      country.toLowerCase().includes(query)
    );
  });

  const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value && selectRef.value) {
      await nextTick();
      updateDropdownPosition();
      // Фокусируемся на поле поиска при открытии
      if (searchInputRef.value) {
        searchInputRef.value.focus();
      }
    } else {
      // Очищаем поиск при закрытии
      searchQuery.value = "";
    }
  };

  const updateDropdownPosition = () => {
    if (selectRef.value) {
      const rect = selectRef.value.getBoundingClientRect();
      dropdownPosition.value = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
    }
  };

  const selectCountry = (country: string) => {
    emit("update:modelValue", country);
    isOpen.value = false;
    searchQuery.value = "";
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.value &&
      !selectRef.value.contains(event.target as Node) &&
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      isOpen.value = false;
      searchQuery.value = "";
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen.value) {
      isOpen.value = false;
      searchQuery.value = "";
    }
  };

  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchQuery.value = target.value;
  };

  const handleSearchKeydown = (event: KeyboardEvent) => {
    // Предотвращаем закрытие dropdown при нажатии на Enter в поле поиска
    if (event.key === "Enter") {
      event.preventDefault();
      // Если есть одна страна в результатах, выбираем ее
      const firstCountry = filteredCountries.value[0];
      if (firstCountry) {
        selectCountry(firstCountry);
      }
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", updateDropdownPosition);
    window.removeEventListener("scroll", updateDropdownPosition, true);
  });
</script>

<template>
  <div :class="[$style.selectBlock, props.error ? $style.hasError : '']">
    <div
      ref="selectRef"
      :class="[
        $style.selectRoot,
        $attrs.class,
        isOpen && $style.isOpen,
        props.error && $style.hasErrorState,
      ]"
      @click="toggleDropdown"
    >
      <span
        :class="[
          $style.selectValue,
          !selectedCountry && $style.placeholder,
        ]"
      >
        {{ displayValue }}
      </span>
      <UIcon
        name="i-chevron-down"
        :class="[$style.chevronIcon, isOpen && $style.chevronOpen]"
      />
    </div>
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :class="$style.dropdown"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }"
        >
          <div :class="$style.searchContainer">
            <input
              ref="searchInputRef"
              :class="$style.searchInput"
              type="text"
              :value="searchQuery"
              placeholder="Поиск страны..."
              @input="handleSearchInput"
              @keydown="handleSearchKeydown"
            />
          </div>
          <div :class="$style.dropdownList">
            <button
              v-for="country in filteredCountries"
              :key="country"
              :class="[
                $style.dropdownItem,
                selectedCountry === country && $style.selected,
              ]"
              type="button"
              @click="selectCountry(country)"
            >
              {{ country }}
            </button>
            <div
              v-if="filteredCountries.length === 0"
              :class="$style.noResults"
            >
              Страна не найдена
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <small v-if="props.error" :class="$style.errorText">{{ props.error }}</small>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .selectBlock {
    position: relative;
    width: 100%;
  }

  .hasError {
    .selectRoot {
      border-color: var(--a-border-accent) !important;
      &.isOpen {
        border-color: var(--a-error) !important;
        box-shadow: 0 0 0 2px rgba(var(--a-btnAccentBg), 0.1) !important;
      }
    }
  }

  .selectRoot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: rem(54);
    padding: 0 rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    background: var(--a-whiteBg);
    cursor: pointer;
    user-select: none;

    &:hover {
      border-color: var(--a-border-primary);
    }

    &.isOpen {
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }

    &.hasErrorState {
      border-color: var(--a-border-accent) !important;
      &.isOpen {
        border-color: var(--a-error) !important;
        box-shadow: 0 0 0 2px rgba(var(--a-btnAccentBg), 0.1) !important;
      }
    }
  }

  .selectValue {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.placeholder {
      color: var(--a-text-light);
    }
  }

  .chevronIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-text-dark);
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: rem(8);

    &.chevronOpen {
      transform: rotate(180deg);
    }
  }

  .dropdown {
    position: absolute;
    z-index: z.z("dropdown");
    display: flex;
    flex-direction: column;
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.1);
    max-height: rem(300);
    margin-top: rem(4);
    overflow: hidden;

    // Стилизация полосы прокрутки
    scrollbar-width: thin;
    scrollbar-color: var(--a-text-light) transparent;

    &::-webkit-scrollbar {
      width: rem(6);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: rem(3);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--a-text-light);
      border-radius: rem(3);
      transition: background 0.2s ease;

      &:hover {
        background: var(--a-text-dark);
      }
    }
  }

  .searchContainer {
    padding: rem(8) rem(12);
    border-bottom: rem(1) solid var(--a-border-light);
    flex-shrink: 0;
  }

  .searchInput {
    width: 100%;
    height: rem(40);
    padding: 0 rem(12);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    background: var(--a-whiteBg);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    outline: none;

    &:focus {
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }

    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .dropdownList {
    padding: rem(8) 0;
    overflow-y: auto;
    flex: 1;

    // Стилизация полосы прокрутки для списка
    scrollbar-width: thin;
    scrollbar-color: var(--a-text-light) transparent;

    &::-webkit-scrollbar {
      width: rem(6);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: rem(3);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--a-text-light);
      border-radius: rem(3);
      transition: background 0.2s ease;

      &:hover {
        background: var(--a-text-dark);
      }
    }
  }

  .dropdownItem {
    display: block;
    width: 100%;
    padding: rem(12) rem(16);
    text-align: left;
    color: var(--a-text-dark);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    background: var(--a-whiteBg);
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--a-bg-light);
      color: var(--a-text-dark);
    }

    &.selected {
      background: var(--a-bg-light);
      color: var(--a-text-dark);
      font-weight: 500;
    }
  }

  .noResults {
    padding: rem(12) rem(16);
    text-align: center;
    color: var(--a-text-light);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
  }

  .errorText {
    display: block;
    margin-top: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-accent);
  }
</style>

<style lang="scss">
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-enter-from {
    opacity: 0;
    transform: translateY(-rem(8));
  }

  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-rem(8));
  }
</style>
