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
      plugins: options?.global?.plugins || [],
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
        // Заглушки для PrimeVue компонентов
        Select: {
          template:
            '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
          props: [
            "modelValue",
            "options",
            "optionLabel",
            "optionValue",
            "placeholder",
          ],
          emits: ["update:modelValue"],
        },
        // Заглушка для BookingCard
        BookingCard: {
          template:
            '<div data-testid="booking-card">{{ room?.title || "" }}</div>',
          props: ["room"],
        },
        // Заглушка для Booking
        Booking: {
          template: '<div data-testid="booking-component"></div>',
        },
        // Заглушки для компонентов календаря
        CoreDatePickerInput: {
          template: `
            <div data-testid="date-picker-input" role="button" @click="$emit('toggle')">
              <slot name="label"></slot>
              <slot name="display"></slot>
            </div>
          `,
          props: ["id", "displayValue", "placeholder", "isOpen"],
          emits: ["toggle"],
        },
        CoreCalendarHeader: {
          template: `
            <nav data-testid="calendar-header">
              <button @click="$emit('prevMonth')" :disabled="!canGoToPrevMonth">Prev</button>
              <span>{{ monthName }} {{ currentYear }}</span>
              <button @click="$emit('nextMonth')">Next</button>
            </nav>
          `,
          props: [
            "currentMonth",
            "currentYear",
            "monthName",
            "canGoToPrevMonth",
          ],
          emits: ["prevMonth", "nextMonth"],
        },
        CoreCalendarGrid: {
          template: `
            <div data-testid="calendar-grid" role="grid">
              <div v-for="day in calendarDays" :key="day.key" @click="$emit('dayClick', day)" data-day>
                {{ day.day }}
              </div>
            </div>
          `,
          props: [
            "calendarDays",
            "weekDays",
            "currentMonthYearLabel",
            "pricesLoading",
          ],
          emits: ["dayClick"],
        },
        CoreCalendarDay: {
          template: `
            <button @click="$emit('click', day)">
              {{ day.day }}
            </button>
          `,
          props: [
            "day",
            "pricesLoading",
            "formatPrice",
            "formatDateForDateTime",
            "getMonthName",
          ],
          emits: ["click"],
        },
        CoreCalendarFooter: {
          template: `
            <div data-testid="calendar-footer">
              <button @click="$emit('cancel')">Cancel</button>
              <button @click="$emit('select')" :disabled="!canSelect">Select</button>
            </div>
          `,
          props: ["canSelect", "displayValue", "cancelLabel", "selectLabel"],
          emits: ["cancel", "select"],
        },
        UIcon: {
          template: "<span></span>",
          props: ["name"],
        },
        ...options?.global?.stubs,
      },
    },
    ...options,
  });
}
