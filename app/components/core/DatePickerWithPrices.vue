<script setup lang="ts">
  import { useI18n } from "vue-i18n";

  const props = defineProps<{
    modelValue: [Date, Date] | null;
  }>();

  const emit = defineEmits(["update:modelValue"]);

  const { t } = useI18n();
  const { fetchCalendarPrices, getPriceForDate, formatPrice, loading: pricesLoading } =
    useCalendarPrices();
  const { monthNames, weekDays, formatDate: formatDateLocale } = useDateLocale();

  // Используем shallowRef для простых значений, которые не требуют глубокой реактивности
  const currentMonth = shallowRef(new Date().getMonth() + 1);
  const currentYear = shallowRef(new Date().getFullYear());
  const selectedStartDate = ref<Date | null>(null);
  const selectedEndDate = ref<Date | null>(null);
  const isOpen = ref(false);

  const value = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
  });

  // Константа today не требует реактивности
  const today = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  watch(
    value,
    (newVal) => {
      if (newVal && newVal.length === 2) {
        selectedStartDate.value = newVal[0];
        selectedEndDate.value = newVal[1];
      } else {
        selectedStartDate.value = null;
        selectedEndDate.value = null;
      }
    },
    { immediate: true },
  );

  // Мемоизированные функции для навигации по месяцам
  const getPrevMonth = useMemoize((month: number, year: number): [number, number] => {
    return month === 1 ? [12, year - 1] : [month - 1, year];
  });

  const getNextMonth = useMemoize((month: number, year: number): [number, number] => {
    return month === 12 ? [1, year + 1] : [month + 1, year];
  });

  const loadPricesForVisibleMonths = async () => {
    const [prevMonth, prevYear] = getPrevMonth(currentMonth.value, currentYear.value);
    const [nextMonth, nextYear] = getNextMonth(currentMonth.value, currentYear.value);
    
    await Promise.all([
      fetchCalendarPrices(currentMonth.value, currentYear.value),
      fetchCalendarPrices(prevMonth, prevYear),
      fetchCalendarPrices(nextMonth, nextYear),
    ]);
  };

  watch(isOpen, (open) => {
    if (open) {
      loadPricesForVisibleMonths();
    }
  });

  watch([currentMonth, currentYear], () => {
    if (isOpen.value) {
      loadPricesForVisibleMonths();
    }
  });

  const displayValue = computed(() => {
    if (selectedStartDate.value && selectedEndDate.value) {
      return `${formatDateLocale(selectedStartDate.value)} - ${formatDateLocale(selectedEndDate.value)}`;
    }
    return "";
  });

  // Мемоизированная функция форматирования даты для datetime атрибута
  const formatDateForDateTime = useMemoize((date: Date): string => {
    const iso = date.toISOString().split('T')[0];
    return iso || '';
  });

  const currentMonthYearLabel = computed(() => {
    return `${monthNames.value[currentMonth.value - 1]} ${currentYear.value}`;
  });

  const currentMonthName = computed(() => {
    return monthNames.value[currentMonth.value - 1] || '';
  });

  // Мемоизированная функция получения названия месяца
  const getMonthName = useMemoize((monthIndex: number): string => {
    return monthNames.value[monthIndex] || '';
  });

  // Генерируем уникальный ID компонента один раз при инициализации
  const datepickerId = `datepicker-${Math.random().toString(36).substring(2, 9)}`;

  const TOTAL_DAYS_NEEDED = 35; // 5 недель * 7 дней

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Понедельник = 0
  };

  // Функция получения состояния даты (не мемоизируется, так как зависит от реактивных значений)
  const getDateState = (dateOnly: Date) => {
    const startTime = selectedStartDate.value?.getTime();
    const endTime = selectedEndDate.value?.getTime();
    const dateTime = dateOnly.getTime();

    return {
      isStartDate: startTime === dateTime,
      isEndDate: endTime === dateTime,
      isInRange: !!(startTime && endTime && dateTime > startTime && dateTime < endTime),
      isPast: dateOnly < today,
    };
  };

  // Мемоизированная функция создания даты без времени
  const createDateOnly = useMemoize((year: number, month: number, day: number): Date => {
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const createDayObject = (
    dateOnly: Date,
    day: number,
    isCurrentMonth: boolean,
  ) => {
    const state = getDateState(dateOnly);
    const isToday = dateOnly.getTime() === today.getTime();

    return {
      date: dateOnly,
      day,
      isCurrentMonth,
      isToday: isCurrentMonth ? isToday : false,
      isStartDate: state.isStartDate,
      isEndDate: state.isEndDate,
      isInRange: state.isInRange,
      isPast: state.isPast,
      price: getPriceForDate(dateOnly),
      // Уникальный ключ для оптимизации рендеринга
      key: dateOnly.toISOString(),
    };
  };

  // Оптимизированный computed для дней календаря
  const calendarDays = computed(() => {
    const days: Array<{
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
    }> = [];

    const daysInMonth = getDaysInMonth(currentMonth.value, currentYear.value);
    const firstDay = getFirstDayOfMonth(currentMonth.value, currentYear.value);

    const [prevMonth, prevYear] = getPrevMonth(currentMonth.value, currentYear.value);
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateOnly = createDateOnly(prevYear, prevMonth, day);
      days.push(createDayObject(dateOnly, day, false));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateOnly = createDateOnly(currentYear.value, currentMonth.value, day);
      days.push(createDayObject(dateOnly, day, true));
    }

    const remainingDays = Math.max(0, TOTAL_DAYS_NEEDED - days.length);
    const [nextMonth, nextYear] = getNextMonth(currentMonth.value, currentYear.value);

    for (let day = 1; day <= remainingDays; day++) {
      const dateOnly = createDateOnly(nextYear, nextMonth, day);
      days.push(createDayObject(dateOnly, day, false));
    }

    return days;
  });

  const handleDateClick = (day: {
    date: Date;
    isPast: boolean;
    isCurrentMonth: boolean;
  }) => {
    if (day.isPast) return;

    const clickedDate = new Date(day.date);
    clickedDate.setHours(0, 0, 0, 0);

    if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
      selectedStartDate.value = clickedDate;
      selectedEndDate.value = null;
      value.value = null;
    } 
    // Если есть только начальная дата
    else if (selectedStartDate.value && !selectedEndDate.value) {
      if (clickedDate < selectedStartDate.value) {
        // Если кликнули дату раньше начальной, меняем местами
        selectedEndDate.value = selectedStartDate.value;
        selectedStartDate.value = clickedDate;
      } else {
        // Завершение диапазона
        selectedEndDate.value = clickedDate;
      }
      
      // Обновляем значение через emit
      if (selectedStartDate.value && selectedEndDate.value) {
        value.value = [selectedStartDate.value, selectedEndDate.value];
      }
    }
  };

  // Проверка, можно ли перейти к предыдущему месяцу
  const canGoToPrevMonth = computed(() => {
    const todayDate = new Date();
    const currentMonthNum = todayDate.getMonth() + 1;
    const currentYearNum = todayDate.getFullYear();
    
    return !(currentMonth.value === currentMonthNum && currentYear.value === currentYearNum);
  });

  const prevMonth = () => {
    if (!canGoToPrevMonth.value) return;
    
    if (currentMonth.value === 1) {
      currentMonth.value = 12;
      currentYear.value--;
    } else {
      currentMonth.value--;
    }
  };

  const nextMonth = () => {
    if (currentMonth.value === 12) {
      currentMonth.value = 1;
      currentYear.value++;
    } else {
      currentMonth.value++;
    }
  };

  const toggleCalendar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeCalendar = () => {
    isOpen.value = false;
  };

  const clearSelection = () => {
    selectedStartDate.value = null;
    selectedEndDate.value = null;
    value.value = null;
  };

  const handleClearAndClose = () => {
    clearSelection();
    closeCalendar();
  };

  const datepickerRef = ref<HTMLElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (datepickerRef.value && !datepickerRef.value.contains(target)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<template>
  <div ref="datepickerRef" :class="$style.datepickerWithPrices" role="group" aria-label="Выбор дат заезда и выезда">
    <CoreDatePickerInput
      :id="datepickerId"
      :display-value="displayValue"
      :placeholder="t('datepicker.selectDates')"
      :is-open="isOpen"
      @toggle="toggleCalendar"
    >
      <template #label>
        {{ t("datepicker.checkInOut") }}
      </template>
      <template #display>
        <time
          v-if="displayValue && selectedStartDate && selectedEndDate"
          :class="$style.selectedDates"
          :datetime="`${formatDateForDateTime(selectedStartDate)}/${formatDateForDateTime(selectedEndDate)}`"
        >
          {{ displayValue }}
        </time>
        <span v-else :class="$style.placeholder" aria-hidden="true">{{ t("datepicker.selectDates") }}</span>
      </template>
    </CoreDatePickerInput>

    <Transition name="calendar">
      <div
        v-if="isOpen"
        :id="`${datepickerId}-popup`"
        :class="$style.calendarPopup"
        role="dialog"
        aria-modal="true"
        aria-label="Календарь выбора дат"
      >
        <Transition name="overlay">
          <div v-if="pricesLoading" :class="$style.loadingOverlay" role="status" aria-live="polite" aria-label="Загрузка цен">
            <div :class="$style.spinner" aria-hidden="true"></div>
          </div>
        </Transition>

        <CoreCalendarHeader
          :current-month="currentMonth"
          :current-year="currentYear"
          :month-name="currentMonthName"
          :can-go-to-prev-month="canGoToPrevMonth"
          :get-prev-month="getPrevMonth"
          :get-next-month="getNextMonth"
          :get-month-name="getMonthName"
          @prev-month="prevMonth"
          @next-month="nextMonth"
        />

        <CoreCalendarGrid
          :calendar-days="calendarDays"
          :week-days="weekDays"
          :current-month-year-label="currentMonthYearLabel"
          :prices-loading="pricesLoading"
          :format-price="formatPrice"
          :format-date-for-date-time="formatDateForDateTime"
          :get-month-name="getMonthName"
          @day-click="handleDateClick"
        />

        <CoreCalendarFooter
          :can-select="!!(selectedStartDate && selectedEndDate)"
          :display-value="displayValue"
          :cancel-label="t('datepicker.cancel')"
          :select-label="t('datepicker.select')"
          @cancel="handleClearAndClose"
          @select="closeCalendar"
        />
      </div>
    </Transition>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .datepickerWithPrices {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: rem(4);

    @media (min-width: #{size.$desktopMin}) {
      width: calc(50% - rem(12));
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: auto;
      min-width: rem(340);
    }
  }

  .selectedDates {
    font-size: rem(12);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-top: rem(12);
    display: inline-block;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(14);
      margin-top: rem(16);
    }
  }

  .placeholder {
    font-size: rem(12);
    color: var(--a-text-light);
    margin-top: rem(12);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(14);
      margin-top: rem(16);
    }
  }

  .calendarPopup {
    position: absolute;
    top: calc(100% + rem(8));
    left: 0;
    z-index: z.z("dropdown");
    display: flex;
    flex-direction: column;
    width: calc(100vw - rem(32));
    max-width: 100vw;
    min-width: rem(340);
    padding: rem(12);
    background-color: var(--a-whiteBg);
    border: 1px solid var(--a-border-accent);
    border-radius: rem(16);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    overflow: hidden;

    @media (min-width: #{size.$tabletMin}) {
      width: rem(340);
      max-width: none;
    }

    @media (min-width: #{size.$tablet}) {
      width: rem(420);
      min-width: rem(420);
      padding: rem(16);
    }

    @media (min-width: #{size.$desktop}) {
      width: rem(500);
      min-width: rem(500);
      max-width: rem(500);
    }
  }

  .calendar-enter-active,
  .calendar-leave-active {
    transition: opacity 0.2s, transform 0.2s;
  }

  .calendar-enter-from,
  .calendar-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .loadingOverlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: rem(16);
    z-index: 10;
    backdrop-filter: blur(2px);
  }

  .spinner {
    width: rem(40);
    height: rem(40);
    border: rem(3) solid var(--a-border);
    border-top-color: var(--a-primaryBg);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .overlay-enter-active,
  .overlay-leave-active {
    transition: opacity 0.2s;
  }

  .overlay-enter-from,
  .overlay-leave-to {
    opacity: 0;
  }
</style>
