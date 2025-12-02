<script setup lang="ts">
  const props = defineProps<{
    currentMonth: number;
    currentYear: number;
    monthName: string;
    canGoToPrevMonth: boolean;
    getPrevMonth: (month: number, year: number) => [number, number];
    getNextMonth: (month: number, year: number) => [number, number];
    getMonthName: (monthIndex: number) => string;
  }>();

  const emit = defineEmits<{
    prevMonth: [];
    nextMonth: [];
  }>();

  const prevMonthLabel = computed(() => {
    const [prevMonth, prevYear] = props.getPrevMonth(props.currentMonth, props.currentYear);
    return `${props.getMonthName(prevMonth - 1)} ${prevYear}`;
  });

  const nextMonthLabel = computed(() => {
    const [nextMonth, nextYear] = props.getNextMonth(props.currentMonth, props.currentYear);
    return `${props.getMonthName(nextMonth - 1)} ${nextYear}`;
  });
</script>

<template>
  <nav :class="$style.calendarHeader" aria-label="Навигация по месяцам">
    <button
      type="button"
      :class="$style.navButton"
      :disabled="!canGoToPrevMonth"
      :aria-label="`Предыдущий месяц: ${prevMonthLabel}`"
      @click="emit('prevMonth')"
    >
      <UIcon name="i-arrow-back" :class="[$style.navIcon, $style.navIconPrev]" aria-hidden="true" />
    </button>
    <time :class="$style.monthYear" :datetime="`${currentYear}-${String(currentMonth).padStart(2, '0')}`">
      {{ monthName }} {{ currentYear }}
    </time>
    <button
      type="button"
      :class="$style.navButton"
      :aria-label="`Следующий месяц: ${nextMonthLabel}`"
      @click="emit('nextMonth')"
    >
      <UIcon name="i-arrow-back" :class="[$style.navIcon, $style.navIconNext]" aria-hidden="true" />
    </button>
  </nav>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .calendarHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: rem(12);
    list-style: none;

    @media (min-width: #{size.$tablet}) {
      margin-bottom: rem(16);
    }
  }

  .navButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(28);
    height: rem(28);
    padding: 0;
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      width: rem(32);
      height: rem(32);
    }

    &:hover:not(:disabled) {
      background-color: var(--ui-color-secondary-200);
      border-radius: rem(4);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .navIcon {
    width: rem(18);
    height: rem(18);

    @media (min-width: #{size.$tablet}) {
      width: rem(20);
      height: rem(20);
    }
  }

  .navIconNext {
    transform: rotate(180deg);
  }

  .monthYear {
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-dark);
    display: inline-block;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }
</style>

