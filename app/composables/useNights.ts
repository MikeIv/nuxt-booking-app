/**
 * Composable для вычисления количества ночей между двумя датами
 * @param dateRange - массив из двух дат [дата заезда, дата выезда] или null
 * @returns Computed значение количества ночей
 */
export const useNights = (
  dateRange: MaybeRef<[Date, Date] | null | undefined>,
) => {
  const date = toRef(dateRange);

  const nights = computed(() => {
    if (!date.value || date.value.length < 2) return 0;

    const start = new Date(date.value[0]);
    const end = new Date(date.value[1]);

    // Проверка на валидность дат
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffTime = end.getTime() - start.getTime();

    // Если дата окончания раньше даты начала, возвращаем 0
    if (diffTime <= 0) return 0;

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  return nights;
};
