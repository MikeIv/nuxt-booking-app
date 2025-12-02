/**
 * Composable для работы с локализованными названиями месяцев и дней недели
 * Использует vue-i18n для поддержки смены языка
 */
export const useDateLocale = () => {
  const { locale } = useI18n();

  // Локаль для форматирования дат (ru-RU, en-US)
  const dateLocale = computed(() => {
    return locale.value === "ru" ? "ru-RU" : "en-US";
  });

  // Кэш для названий месяцев и дней недели по локали (статический, не реактивный)
  const monthNamesCache = new Map<string, string[]>();
  const weekDaysCache = new Map<string, string[]>();

  // Названия месяцев (полные) с кэшированием
  const monthNames = computed(() => {
    const localeKey = dateLocale.value;

    if (monthNamesCache.has(localeKey)) {
      return monthNamesCache.get(localeKey)!;
    }

    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      const monthName = date.toLocaleDateString(localeKey, {
        month: "long",
      });
      // Первая буква заглавная
      months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    }

    monthNamesCache.set(localeKey, months);
    return months;
  });

  // Названия дней недели (сокращенные, начиная с понедельника) с кэшированием
  const weekDays = computed(() => {
    const localeKey = dateLocale.value;

    if (weekDaysCache.has(localeKey)) {
      return weekDaysCache.get(localeKey)!;
    }

    const days: string[] = [];
    // 1 января 2024 - понедельник (getDay() = 1, но нам нужно 0 для понедельника)
    // Создаем дату понедельника
    const monday = new Date(2024, 0, 1); // 1 января 2024 - понедельник
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dayName = date.toLocaleDateString(localeKey, {
        weekday: "short",
      });
      days.push(dayName);
    }

    weekDaysCache.set(localeKey, days);
    return days;
  });

  // Форматирование даты с учетом локали
  const formatDate = (
    date: Date | null,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    if (!date) return "--.--.----";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    return date
      .toLocaleDateString(dateLocale.value, options || defaultOptions)
      .replace(/\//g, ".");
  };

  return {
    monthNames,
    weekDays,
    formatDate,
    dateLocale,
  };
};
