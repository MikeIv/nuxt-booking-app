<script setup lang="ts">
  interface Day {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isStartDate: boolean;
    isEndDate: boolean;
    isInRange: boolean;
    isPast: boolean;
    price: number | null;
    key: string;
  }

  defineProps<{
    calendarDays: Day[];
    weekDays: string[];
    currentMonthYearLabel: string;
    pricesLoading: boolean;
    formatPrice: (price: number) => string;
    formatDateForDateTime: (date: Date) => string;
    getMonthName: (monthIndex: number) => string;
  }>();

  const emit = defineEmits<{
    dayClick: [day: Day];
  }>();
</script>

<template>
  <div :class="$style.calendarGrid" role="grid" :aria-label="`Календарь ${currentMonthYearLabel}`">
    <div :class="$style.weekDays" role="row">
      <div
        v-for="day in weekDays"
        :key="day"
        :class="$style.weekDay"
        role="columnheader"
        :aria-label="day"
      >
        {{ day }}
      </div>
    </div>
    <div :class="$style.calendarDays" role="rowgroup">
      <CoreCalendarDay
        v-for="day in calendarDays"
        :key="day.key"
        v-memo="[day.key, day.price, day.isStartDate, day.isEndDate, day.isInRange, day.isPast, pricesLoading]"
        :day="day"
        :prices-loading="pricesLoading"
        :format-price="formatPrice"
        :format-date-for-date-time="formatDateForDateTime"
        :get-month-name="getMonthName"
        @click="emit('dayClick', $event)"
      />
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .calendarGrid {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    @media (min-width: #{size.$tablet}) {
      gap: rem(6);
    }
  }

  .weekDays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: rem(2);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    @media (min-width: #{size.$tablet}) {
      gap: rem(4);
    }
  }

  .weekDay {
    display: flex;
    align-items: center;
    justify-content: center;
    height: rem(24);
    font-size: rem(10);
    font-weight: 600;
    color: var(--a-text-light);

    @media (min-width: #{size.$tablet}) {
      height: rem(28);
      font-size: rem(12);
    }
  }

  .calendarDays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: rem(2);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    @media (min-width: #{size.$tablet}) {
      gap: rem(4);
    }
  }
</style>

