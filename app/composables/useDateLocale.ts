/**
 * Composable для работы с локализованными названиями месяцев и дней недели
 * Использует vue-i18n для поддержки смены языка
 */
const monthNamesCache = new Map<string, string[]>();
const weekDaysCache = new Map<string, string[]>();
const MONDAY_2024 = new Date(2024, 0, 1);

export const useDateLocale = () => {
  const { locale } = useI18n();

  // Локаль для форматирования дат (ru-RU, en-GB — день/месяц/год, неделя с понедельника)
  const dateLocale = computed(() => {
    return locale.value === "ru" ? "ru-RU" : "en-GB";
  });

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
    for (let i = 0; i < 7; i++) {
      const date = new Date(MONDAY_2024);
      date.setDate(MONDAY_2024.getDate() + i);
      const dayName = date.toLocaleDateString(localeKey, {
        weekday: "short",
      });
      days.push(dayName.replace(/\.$/, ""));
    }

    weekDaysCache.set(localeKey, days);
    return days;
  });

  // Форматирование даты: всегда ДД.ММ.ГГГГ (как в ru-RU), независимо от языка UI
  const formatDate = (
    date: Date | null,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    if (!date) return "--.--.----";

    if (options) {
      return date
        .toLocaleDateString(dateLocale.value, options)
        .replace(/\//g, ".");
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());

    return `${day}.${month}.${year}`;
  };

  return {
    monthNames,
    weekDays,
    formatDate,
    dateLocale,
  };
};
