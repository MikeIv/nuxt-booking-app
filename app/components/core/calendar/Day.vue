<script setup lang="ts">
  const props = defineProps<{
    day: {
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
    };
    pricesLoading: boolean;
    formatPrice: (price: number) => string;
    formatDateForDateTime: (date: Date) => string;
    getMonthName: (monthIndex: number) => string;
  }>();

  const emit = defineEmits<{
    click: [day: typeof props.day];
  }>();

  const dayLabel = computed(() => {
    const monthName = props.getMonthName(props.day.date.getMonth());
    const year = props.day.date.getFullYear();
    const priceText = props.day.price !== null ? `, цена: ${props.formatPrice(props.day.price)}` : '';
    return `${props.day.day} ${monthName} ${year}${priceText}`;
  });
</script>

<template>
  <button
    type="button"
    :class="[
      $style.calendarDay,
      {
        [$style.calendarDayOtherMonth]: !day.isCurrentMonth,
        [$style.calendarDayToday]: day.isToday,
        [$style.calendarDayStart]: day.isStartDate,
        [$style.calendarDayEnd]: day.isEndDate,
        [$style.calendarDayInRange]: day.isInRange,
        [$style.calendarDayPast]: day.isPast,
      },
    ]"
    role="gridcell"
    :aria-label="dayLabel"
    :aria-selected="day.isStartDate || day.isEndDate"
    :aria-disabled="day.isPast"
    :disabled="day.isPast"
    @click="emit('click', day)"
  >
    <time :class="$style.dayNumber" :datetime="formatDateForDateTime(day.date)">
      {{ day.day }}
    </time>
    <span
      v-if="day.price !== null"
      :class="$style.dayPrice"
      aria-label="Цена"
    >
      {{ formatPrice(day.price) }}
    </span>
    <span
      v-else-if="pricesLoading"
      :class="[$style.dayPrice, $style.dayPriceLoading]"
      aria-label="Загрузка"
    >
      ...
    </span>
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .calendarDay {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 100%;
    min-height: rem(44);
    padding: rem(2) rem(2);
    border: 1px solid transparent;
    border-radius: rem(6);
    background-color: transparent;
    transition: all 0.2s;
    color: var(--a-text-dark);
    cursor: pointer;
    box-sizing: border-box;
    overflow: hidden;

    @media (min-width: #{size.$tablet}) {
      min-height: rem(54);
      padding: rem(4) rem(4);
      border-radius: rem(8);
    }

    &:hover:not(:disabled) {
      background-color: var(--ui-color-primary-50);
      border-color: var(--ui-color-primary-300);

      .dayPrice {
        color: var(--a-text-primary);
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .calendarDayOtherMonth {
    color: var(--a-text-light);
  }

  .calendarDayToday {
    border-color: var(--info);
    background-color: var(--a-whiteBg);
    color: var(--a-text-dark);
  }

  .calendarDayStart,
  .calendarDayEnd {
    color: var(--a-white);
    background-color: var(--a-primaryBg);
    font-weight: 600;
  }

  .calendarDayInRange {
    background-color: var(--a-accentLightBg);
    color: var(--a-text-dark);
  }

  .calendarDayPast {
    opacity: 0.4;
  }

  .dayNumber {
    font-size: rem(12);
    font-weight: 500;
    margin-bottom: rem(2);
    color: var(--a-text-dark);
    display: inline-block;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(14);
      margin-bottom: rem(3);
    }
  }

  .calendarDayOtherMonth .dayNumber {
    color: var(--a-text-light);
  }

  .calendarDayOtherMonth.calendarDayStart .dayNumber,
  .calendarDayOtherMonth.calendarDayEnd .dayNumber {
    color: var(--a-text-dark);
  }

  .dayPrice {
    font-size: rem(8);
    font-weight: 600;
    color: var(--ui-color-primary-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    width: 100%;
    line-height: 1.2;
    text-align: center;
    box-sizing: border-box;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(9);
    }
  }

  .dayPriceLoading {
    color: var(--a-text-light);
  }

  .calendarDayStart .dayPrice,
  .calendarDayEnd .dayPrice {
    color: var(--a-text-white);
  }

  .calendarDayStart:hover:not(:disabled) .dayPrice,
  .calendarDayEnd:hover:not(:disabled) .dayPrice {
    color: var(--a-text-primary);
  }
</style>

