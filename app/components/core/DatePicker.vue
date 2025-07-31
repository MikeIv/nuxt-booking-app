<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";

  const props = defineProps<{
    modelValue: [Date, Date] | null;
  }>();

  const hidenIcon = ref(true);

  const emit = defineEmits(["update:modelValue"]);

  const value = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
  });

  // Следим за изменениями value
  watch(
    value,
    (newVal) => {
      hidenIcon.value = !newVal || newVal.length !== 2;
    },
    { immediate: true },
  );

  const formatDate = (date: Date | null): string => {
    if (!date) return "--.--.----";
    return date
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  };

  const formatDisplayValue = (dates: Date[] | null): string => {
    if (!dates || dates.length !== 2) return "";
    return `${formatDate(dates[0])} - ${formatDate(dates[1])}`;
  };
</script>

<template>
  <div class="datepicker-container">
    <span class="period-label">Заезд — выезд</span>
    <VueDatePicker
      v-model="value"
      range
      :enable-time-picker="false"
      :format="formatDisplayValue"
      locale="ru"
      :max-range="365"
      cancel-text="Отмена"
      select-text="Выбрать"
      :input-class-name="'custom-datepicker-input'"
      :multi-calendars="true"
      class="date-range-picker"
    >
      <template #input-icon>
        <div class="calendar-icon-wrapper">
          <UIcon v-if="hidenIcon" name="i-calendar" class="calendarIcon" />
        </div>
      </template>
      <template #input-value="{ value }">
        <div class="date-display">
          <span v-if="value?.length === 2" class="selected-dates">
            {{ formatDisplayValue(value) }}
          </span>
        </div>
      </template>
    </VueDatePicker>
  </div>
</template>

<style lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .datepicker-container {
    position: relative;
    display: flex;
    flex-direction: column;
    width: rem(366);
    gap: rem(4);

    .period-label {
      position: absolute;
      top: rem(8);
      left: rem(50);
      font-size: rem(12);
      font-weight: 400;
      font-family: Inter, sans-serif;
      color: var(--a-text-light);
      margin-left: rem(12);
      z-index: z.z("booking-label");
    }
  }

  .date-range-picker {
    position: relative;
    display: flex;
    padding: 0;
    font-family: "Inter", sans-serif;

    & .dp__calendar_item .dp--future {
      font-weight: 500;
      color: var(--ui-color-primary-700);
      background-color: var(--ui-color-primary-50);

      &.dp__range_start {
        color: var(--ui-color-primary-100);
        background-color: var(--primary);
      }

      &.dp__range_between {
        color: var(--ui-color-primary-600);
        background-color: var(--ui-color-primary-300);
      }

      &.dp__range_end {
        color: var(--ui-color-primary-100);
        background-color: var(--primary);
      }
    }

    & .dp__calendar_item .dp__today {
      font-weight: 500;
      color: var(--info);
    }

    & .dp__calendar_item .dp--past {
      color: var(--ui-color-secondary-300);
    }

    & .dp__input_wrap {
      display: flex;
      width: 100%;
      height: rem(67);
      color: var(--a-mainText);
      position: relative;
    }

    & .dp__outer_menu_wrap {
      left: 0 !important;
    }

    & .dp__input {
      display: flex;
      width: 100%;
      padding: rem(22) rem(36) rem(2) rem(12);
      font-family: "Inter", sans-serif;
      font-size: rem(16);
      border: none;
      border-radius: rem(16);
      background-color: var(--a-white);
      position: relative;

      &:hover {
        border-color: var(--a-borderAccent);
        outline: none;
      }
    }

    .dp__input_icon {
      position: absolute;
      right: rem(12);
      left: auto;
      top: 50%;
      transform: translateY(-50%);
    }

    .calendar-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dp__today {
      background-color: var(--a-mainBg);
      border: 1px solid var(--a-borderAccent);
    }

    .dp--header-wrap {
      background-color: var(--a-mainBg);
    }

    .dp__action_buttons {
      display: flex;
      align-items: center;
      gap: rem(12);

      & .dp__action_button {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: rem(28);
        padding: rem(8) rem(12);
        border: none;
      }

      & .dp__action_cancel {
        font-weight: 600;
        color: var(--ui-color-secondary-950);
        background-color: var(--ui-color-secondary-200);

        &:hover {
          color: var(--a-white);
          background-color: var(--ui-color-secondary-500);
        }
      }

      & .dp__action_select {
        font-weight: 600;
        background-color: var(--primary);

        &:hover {
          color: var(--a-white);
          background-color: var(--ui-color-primary-600);
        }
      }
    }

    .date-display {
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
    }

    .selected-dates {
      font-size: rem(14);
      font-weight: 600;
      color: var(--a-mainText);
      margin-top: rem(16);
    }
  }

  .calendarIcon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--a-text-light);
    width: rem(30);
    height: rem(30);
  }
</style>
