export interface PriceCalendarResource {
  date_at: string;
  min_price: number;
}

export const useCalendarPrices = () => {
  const api = useApi();
  const prices = ref<Map<string, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const activeRequests = ref(0);
  // Кэш загруженных месяцев/годов
  const loadedMonths = ref<Set<string>>(new Set());
  // Дедупликация: отслеживаем активные запросы для каждого месяца
  const pendingRequests = ref<Map<string, Promise<void>>>(new Map());

  // Функция для создания ключа месяца/года
  const getMonthKey = (month: number, year: number): string => {
    return `${year}-${month}`;
  };

  // Проверка, есть ли данные для месяца (проверяем наличие хотя бы одной даты этого месяца)
  const hasMonthData = (month: number, year: number): boolean => {
    const monthKey = getMonthKey(month, year);

    // Если месяц уже помечен как загруженный, проверяем наличие данных
    if (loadedMonths.value.has(monthKey)) {
      // Проверяем, есть ли хотя бы одна дата этого месяца в кэше
      const yearMonthStr = `${year}-${String(month).padStart(2, "0")}`;
      for (const dateStr of prices.value.keys()) {
        if (dateStr.startsWith(yearMonthStr)) {
          return true;
        }
      }
      // Если данных нет, удаляем из кэша загруженных месяцев
      loadedMonths.value.delete(monthKey);
    }

    return false;
  };

  const fetchCalendarPrices = async (month: number, year: number) => {
    if (month < 1 || month > 12) {
      throw new Error("Месяц должен быть от 1 до 12");
    }
    if (year < 2024 || year > 2100) {
      throw new Error("Год должен быть от 2024 до 2100");
    }

    const monthKey = getMonthKey(month, year);

    // Если данные уже загружены, пропускаем запрос
    if (hasMonthData(month, year)) {
      return;
    }

    // Если запрос для этого месяца уже выполняется, ждём его завершения
    if (pendingRequests.value.has(monthKey)) {
      await pendingRequests.value.get(monthKey);
      return;
    }

    // Создаём промис для нового запроса
    const requestPromise = (async () => {
      activeRequests.value++;
      loading.value = true;
      error.value = null;

      try {
        const response = await api.get<PriceCalendarResource[]>(
          "/v1/search/calendar",
          {
            month,
            year,
          },
        );

        if (response.success && response.payload) {
          // Объединяем новые цены с существующими, а не перезаписываем
          response.payload.forEach((item) => {
            prices.value.set(item.date_at, item.min_price);
          });
          // Помечаем месяц как загруженный
          loadedMonths.value.add(monthKey);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        error.value = apiError.message || "Ошибка при загрузке цен календаря";
        console.error("Ошибка загрузки цен календаря:", err);
      } finally {
        activeRequests.value--;
        // Удаляем запрос из списка активных
        pendingRequests.value.delete(monthKey);
        // Сбрасываем loading только когда все запросы завершены
        if (activeRequests.value === 0) {
          loading.value = false;
        }
      }
    })();

    // Сохраняем промис для дедупликации
    pendingRequests.value.set(monthKey, requestPromise);
    await requestPromise;
  };

  const getPriceForDate = (date: Date): number | null => {
    const dateStr = date.toISOString().split("T")[0] as string;
    const price = prices.value.get(dateStr);
    return price ?? null;
  };

  // Мемоизированный форматтер для оптимизации производительности
  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price);
  };

  // Принудительное обновление цен для месяца (игнорируя кэш)
  const refreshCalendarPrices = async (month: number, year: number) => {
    const monthKey = getMonthKey(month, year);
    // Удаляем из кэша, чтобы принудительно загрузить заново
    loadedMonths.value.delete(monthKey);
    await fetchCalendarPrices(month, year);
  };

  // Очистка кэша (для сброса всех загруженных данных)
  const clearCache = () => {
    loadedMonths.value.clear();
    prices.value.clear();
    pendingRequests.value.clear();
  };

  return {
    prices: readonly(prices),
    loading: readonly(loading),
    error: readonly(error),
    fetchCalendarPrices,
    refreshCalendarPrices,
    clearCache,
    getPriceForDate,
    formatPrice,
  };
};
