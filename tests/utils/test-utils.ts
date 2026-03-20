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
  const defaultStubs = {
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
    CoreDatePickerWithPrices: {
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
      template: '<div data-testid="booking-card">{{ room?.title || "" }}</div>',
      props: ["room"],
    },
    // Заглушка для Booking
    Booking: {
      template: '<div data-testid="booking-component"></div>',
    },
    CommonBannersList: {
      template: '<div data-testid="banners-list"></div>',
      props: ["banners"],
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
      props: ["currentMonth", "currentYear", "monthName", "canGoToPrevMonth"],
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
    // Заглушки для компонентов Card.vue
    BookingCarousel: {
      template: '<div data-testid="booking-carousel"></div>',
      props: ["images", "altPrefix", "altText", "height"],
    },
    BookingRoomPopup: {
      template: '<div v-if="isOpen" data-testid="booking-room-popup"></div>',
      props: ["room", "isOpen"],
      emits: ["close"],
    },
    Button: {
      template:
        '<button @click="$attrs.onClick" :disabled="disabled" :class="$attrs.class">{{ label }}<slot /></button>',
      props: ["disabled", "unstyled", "label"],
    },
    ProgressSpinner: {
      template: '<div data-testid="progress-spinner"></div>',
      props: ["style", "strokeWidth", "fill", "animationDuration", "ariaLabel"],
    },
    // Заглушки для BookingSummary
    BookingSummary: {
      template: '<div data-testid="booking-summary"></div>',
      props: [
        "selectedEntries",
        "date",
        "nights",
        "bookingTotal",
        "showContinue",
      ],
    },
    // Заглушки для компонентов страницы confirmation
    BookingConfirmationManagement: {
      template: `
        <div v-if="hasManagementActions" data-testid="booking-management">
          <button v-if="canEditDates" @click="$emit('change-dates')">Изменить даты</button>
          <button v-if="canEditRoom" @click="$emit('change-room')">Изменить номер</button>
          <button v-if="canEditPackages" @click="$emit('change-services')">Изменить услуги</button>
          <button v-if="canEditContacts" @click="$emit('change-contacts')">Изменить контакты</button>
        </div>
      `,
      props: [
        "hasManagementActions",
        "canEditDates",
        "canEditRoom",
        "canEditPackages",
        "canEditContacts",
      ],
      emits: [
        "change-dates",
        "change-room",
        "change-services",
        "change-contacts",
      ],
    },
    BookingConfirmationCancelPopup: {
      template: '<div v-if="isOpen" data-testid="cancel-popup"></div>',
      props: ["isOpen", "isCancellingBooking", "cancelBookingError"],
      emits: ["close", "confirm"],
    },
    BookingConfirmationChangeDatesPopup: {
      template: '<div v-if="isOpen" data-testid="change-dates-popup"></div>',
      props: [
        "isOpen",
        "modelValue",
        "isCalendarOpen",
        "canSubmitDateChange",
        "isChangingDates",
        "changeDatesSuccess",
        "changeDatesError",
      ],
      emits: ["close", "confirm", "update:modelValue", "update:isCalendarOpen"],
    },
    BookingConfirmationChangeContactsPopup: {
      template: '<div v-if="isOpen" data-testid="change-contacts-popup"></div>',
      props: [
        "isOpen",
        "form",
        "canSubmitContactChange",
        "isChangingContacts",
        "changeContactsSuccess",
        "changeContactsError",
      ],
      emits: ["close", "confirm", "update:form"],
    },
  } as const;

  const userGlobal = options?.global ?? {};
  const mergedGlobal = {
    ...userGlobal,
    plugins: [...(userGlobal.plugins ?? [])],
    stubs: {
      ...defaultStubs,
      ...(userGlobal.stubs ?? {}),
    },
  };

  return mount(component, {
    ...options,
    global: mergedGlobal,
  });
}
