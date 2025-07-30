<script setup lang="ts">
  import { computed } from "vue";
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "@vuepic/vue-datepicker/dist/main.css";

  const props = defineProps<{
    modelValue: [Date, Date] | null;
  }>();

  const emit = defineEmits(["update:modelValue"]);

  const value = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
  });

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
    if (!dates || dates.length !== 2) return "Выберите период";
    return `${formatDate(dates[0])} - ${formatDate(dates[1])}`;
  };
</script>

<template>
  <VueDatePicker
    v-model="value"
    range
    :enable-time-picker="false"
    :format="formatDisplayValue"
    locale="ru"
    :max-range="365"
    :max-date="new Date()"
    cancel-text="Отмена"
    select-text="Выбрать"
    :input-class-name="'custom-datepicker-input'"
    placeholder="выберите период"
    class="date-range-picker"
  >
    <template #input-value="{ value }">
      <span v-if="value?.length === 2">
        {{ formatDisplayValue(value) }}
      </span>
      <span v-else> Выберите период </span>
    </template>
  </VueDatePicker>
</template>

<style lang="scss">
  .date-range-picker {
    position: relative;
    display: flex;
    width: rem(260);
    padding: 0;

    & .dp__input_wrap {
      display: flex;
      width: 100%;
      height: rem(44);
      color: var(--a-mainText);
    }

    & .dp__outer_menu_wrap {
      left: 0 !important;
    }

    & .dp__input {
      display: flex;
      width: 100%;
      padding: rem(2) rem(24) rem(2) rem(36);
      font-family: "Inter", sans-serif;
      font-size: rem(12);
      border: none;
      background-color: var(--a-white);

      &:hover {
        border-color: var(--a-borderAccent);
        outline: none;
      }

      &::placeholder {
        font-size: rem(12);
        font-weight: 500;
        font-family: "Montserrat", sans-serif;
        color: var(--a-mainTextLight);
      }
    }

    .dp__today {
      background-color: var(--a-mainBg);
      border: 1px solid var(--a-borderAccent);
    }

    .dp--header-wrap {
      background-color: var(--a-mainBg);
    }

    .dp__range_start {
      background-color: var(--primary);
    }

    .dp__range_end {
      background-color: var(--primary);
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
  }

  .date-text {
    font-size: rem(12);
    font-weight: 600;
    font-family: "Montserrat", sans-serif;
  }
</style>
