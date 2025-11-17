/**
 * Вспомогательные утилиты для тестирования Vue компонентов
 */
import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import type { Component } from "vue";

/**
 * Создает экземпляр Pinia для тестов
 */
export function setupPinia() {
  setActivePinia(createPinia());
}

/**
 * Монтирует компонент с базовыми настройками для тестов
 */
export function mountComponent<T extends Component>(
  component: T,
  options?: Parameters<typeof mount<T>>[1],
): VueWrapper<InstanceType<T>> {
  return mount(component, {
    global: {
      stubs: {
        // Заглушки для Nuxt UI компонентов
        UButton: {
          template:
            '<button @click="$attrs.onClick" :disabled="disabled"><slot /></button>',
          props: ["loading", "disabled"],
        },
        // Заглушки для Core компонентов
        CoreDatePicker: {
          template: '<input data-testid="date-picker" />',
          props: ["modelValue"],
          emits: ["update:modelValue"],
        },
        CoreGuestsSelector: {
          template: '<div data-testid="guests-selector"></div>',
          props: ["modelValue"],
          emits: ["update:modelValue"],
        },
        CorePromoCodeInput: {
          template: '<input data-testid="promo-code-input" />',
          props: ["modelValue"],
          emits: ["update:modelValue"],
        },
        ...options?.global?.stubs,
      },
    },
    ...options,
  });
}
