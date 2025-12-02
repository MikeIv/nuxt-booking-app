/**
 * Пример адаптера для использования календаря с ценами в других проектах
 *
 * Этот файл показывает, как адаптировать useCalendarPrices под разные API клиенты
 */

// ============================================
// Пример 1: Адаптер для fetch API
// ============================================

// ============================================
// Пример 2: Адаптер для axios
// ============================================

import type { AxiosInstance } from "axios";

export const useCalendarPricesWithFetch = (baseURL: string) => {
  const prices = ref<Map<string, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loadedMonths = ref<Set<string>>(new Set());
  const pendingRequests = ref<Map<string, Promise<void>>>(new Map());

  const getMonthKey = (month: number, year: number): string => {
    return `${year}-${month}`;
  };

  const fetchCalendarPrices = async (month: number, year: number) => {
    if (month < 1 || month > 12) {
      throw new Error("Месяц должен быть от 1 до 12");
    }

    const monthKey = getMonthKey(month, year);

    if (loadedMonths.value.has(monthKey)) {
      return;
    }

    if (pendingRequests.value.has(monthKey)) {
      await pendingRequests.value.get(monthKey);
      return;
    }

    const requestPromise = (async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${baseURL}/v1/search/calendar?month=${month}&year=${year}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Адаптируйте под формат вашего API
        if (data.success && data.payload) {
          data.payload.forEach(
            (item: { date_at: string; min_price: number }) => {
              prices.value.set(item.date_at, item.min_price);
            },
          );
          loadedMonths.value.add(monthKey);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        error.value = apiError.message || "Ошибка при загрузке цен календаря";
        console.error("Ошибка загрузки цен календаря:", err);
      } finally {
        loading.value = false;
        pendingRequests.value.delete(monthKey);
      }
    })();

    pendingRequests.value.set(monthKey, requestPromise);
    await requestPromise;
  };

  const getPriceForDate = (date: Date): number | null => {
    const dateStr = date.toISOString().split("T")[0] as string;
    return prices.value.get(dateStr) ?? null;
  };

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price);
  };

  return {
    prices: readonly(prices),
    loading: readonly(loading),
    error: readonly(error),
    fetchCalendarPrices,
    getPriceForDate,
    formatPrice,
  };
};

export const useCalendarPricesWithAxios = (axiosInstance: AxiosInstance) => {
  const prices = ref<Map<string, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loadedMonths = ref<Set<string>>(new Set());
  const pendingRequests = ref<Map<string, Promise<void>>>(new Map());

  const getMonthKey = (month: number, year: number): string => {
    return `${year}-${month}`;
  };

  const fetchCalendarPrices = async (month: number, year: number) => {
    if (month < 1 || month > 12) {
      throw new Error("Месяц должен быть от 1 до 12");
    }

    const monthKey = getMonthKey(month, year);

    if (loadedMonths.value.has(monthKey)) {
      return;
    }

    if (pendingRequests.value.has(monthKey)) {
      await pendingRequests.value.get(monthKey);
      return;
    }

    const requestPromise = (async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await axiosInstance.get("/v1/search/calendar", {
          params: { month, year },
        });

        // Адаптируйте под формат вашего API
        if (response.data.success && response.data.payload) {
          response.data.payload.forEach(
            (item: { date_at: string; min_price: number }) => {
              prices.value.set(item.date_at, item.min_price);
            },
          );
          loadedMonths.value.add(monthKey);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        error.value = apiError.message || "Ошибка при загрузке цен календаря";
        console.error("Ошибка загрузки цен календаря:", err);
      } finally {
        loading.value = false;
        pendingRequests.value.delete(monthKey);
      }
    })();

    pendingRequests.value.set(monthKey, requestPromise);
    await requestPromise;
  };

  const getPriceForDate = (date: Date): number | null => {
    const dateStr = date.toISOString().split("T")[0] as string;
    return prices.value.get(dateStr) ?? null;
  };

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price);
  };

  return {
    prices: readonly(prices),
    loading: readonly(loading),
    error: readonly(error),
    fetchCalendarPrices,
    getPriceForDate,
    formatPrice,
  };
};

// ============================================
// Пример 3: Адаптер для другого формата API
// ============================================

interface CustomApiResponse {
  dates: Array<{
    date: string; // Другой формат поля
    price: number; // Другое название поля
  }>;
}

export const useCalendarPricesCustomFormat = (apiClient: {
  getCalendar: (month: number, year: number) => Promise<CustomApiResponse>;
}) => {
  const prices = ref<Map<string, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loadedMonths = ref<Set<string>>(new Set());
  const pendingRequests = ref<Map<string, Promise<void>>>(new Map());

  const getMonthKey = (month: number, year: number): string => {
    return `${year}-${month}`;
  };

  const fetchCalendarPrices = async (month: number, year: number) => {
    if (month < 1 || month > 12) {
      throw new Error("Месяц должен быть от 1 до 12");
    }

    const monthKey = getMonthKey(month, year);

    if (loadedMonths.value.has(monthKey)) {
      return;
    }

    if (pendingRequests.value.has(monthKey)) {
      await pendingRequests.value.get(monthKey);
      return;
    }

    const requestPromise = (async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await apiClient.getCalendar(month, year);

        // Преобразуем в нужный формат
        response.dates.forEach((item) => {
          prices.value.set(item.date, item.price);
        });

        loadedMonths.value.add(monthKey);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        error.value = apiError.message || "Ошибка при загрузке цен календаря";
        console.error("Ошибка загрузки цен календаря:", err);
      } finally {
        loading.value = false;
        pendingRequests.value.delete(monthKey);
      }
    })();

    pendingRequests.value.set(monthKey, requestPromise);
    await requestPromise;
  };

  const getPriceForDate = (date: Date): number | null => {
    const dateStr = date.toISOString().split("T")[0] as string;
    return prices.value.get(dateStr) ?? null;
  };

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatPrice = (price: number): string => {
    return priceFormatter.format(price);
  };

  return {
    prices: readonly(prices),
    loading: readonly(loading),
    error: readonly(error),
    fetchCalendarPrices,
    getPriceForDate,
    formatPrice,
  };
};

// ============================================
// Пример использования адаптера
// ============================================

/*
// В вашем компоненте или composable:

import { useCalendarPricesWithFetch } from './CalendarAdapterExample';

// Использование с fetch
const { fetchCalendarPrices, getPriceForDate, formatPrice, loading } = 
  useCalendarPricesWithFetch('https://api.example.com');

// Или с axios
import axios from 'axios';
import { useCalendarPricesWithAxios } from './CalendarAdapterExample';

const apiClient = axios.create({ baseURL: 'https://api.example.com' });
const { fetchCalendarPrices, getPriceForDate, formatPrice, loading } = 
  useCalendarPricesWithAxios(apiClient);
*/
