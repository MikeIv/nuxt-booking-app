/**
 * Глобальная настройка для всех тестов
 * Этот файл выполняется перед каждым тестом
 */
import { beforeEach, vi } from "vitest";
import { storeToRefs } from "pinia";
import * as Vue from "vue";
import type { Ref } from "vue";
import { mockRouterPush, mockRoute, mockToastAdd } from "./mocks/nuxt";
import { setupComponentMocks } from "./mocks/components";

// Настраиваем моки компонентов один раз для всех тестов
setupComponentMocks();

// Настраиваем глобальные моки для Nuxt auto-imports
vi.stubGlobal("useRouter", () => ({
  push: mockRouterPush,
}));

vi.stubGlobal("useRoute", () => mockRoute);

vi.stubGlobal("useToast", () => ({
  add: mockToastAdd,
}));

// storeToRefs из Pinia должен быть доступен глобально
vi.stubGlobal("storeToRefs", storeToRefs);

// Мокируем useBookingStore (будет переопределен в тестах через vi.mock, если нужно)
// Базовый мок для компонентов, которые не мокируют store явно
vi.stubGlobal("useBookingStore", () => {
  return {
    date: ref(null),
    guests: ref({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    }),
    setSelectedRoomType: vi.fn(),
    setLoading: vi.fn(),
    search: vi.fn().mockResolvedValue({}),
    loading: ref(false),
    isServerRequest: ref(false),
  };
});

// Мокируем definePageMeta для Nuxt страниц
vi.stubGlobal("definePageMeta", vi.fn());

// Мокируем useMemoize из @vueuse/core (просто возвращает функцию как есть)
vi.stubGlobal(
  "useMemoize",
  <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
);

// Мокируем composables, которые используются в компонентах
vi.stubGlobal("useCalendarPrices", () => ({
  fetchCalendarPrices: vi.fn().mockResolvedValue(undefined),
  getPriceForDate: vi.fn().mockReturnValue(null),
  formatPrice: vi.fn((price: number) => `${price.toLocaleString("ru-RU")} ₽`),
  loading: { value: false },
}));

// Мокируем useNights - должен быть функцией, принимающей dateRange
vi.stubGlobal("useNights", (dateRange: Ref<[Date, Date] | null>) => {
  const nights = Vue.computed(() => {
    if (!dateRange || !dateRange.value || dateRange.value.length < 2) return 0;
    const start = new Date(dateRange.value[0]);
    const end = new Date(dateRange.value[1]);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
  return nights;
});

// Мокируем useRoomCarousel
vi.stubGlobal("useRoomCarousel", () => ({
  carouselImages: Vue.computed(() => [
    "photo1.jpg",
    "photo2.jpg",
    { placeholder: true, label: "Room Photo" },
  ]),
}));

vi.stubGlobal("useDateLocale", () => ({
  monthNames: {
    value: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
  },
  weekDays: { value: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] },
  formatDate: vi.fn((date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }),
}));

// Делаем Vue composables доступными глобально (как в Nuxt auto-imports)
vi.stubGlobal("ref", Vue.ref);
vi.stubGlobal("shallowRef", Vue.shallowRef);
vi.stubGlobal("computed", Vue.computed);
vi.stubGlobal("reactive", Vue.reactive);
vi.stubGlobal("readonly", Vue.readonly);
vi.stubGlobal("watch", Vue.watch);
vi.stubGlobal("watchEffect", Vue.watchEffect);
vi.stubGlobal("onMounted", Vue.onMounted);
vi.stubGlobal("onUnmounted", Vue.onUnmounted);
vi.stubGlobal("onBeforeMount", Vue.onBeforeMount);
vi.stubGlobal("onBeforeUnmount", Vue.onBeforeUnmount);
vi.stubGlobal("onUpdated", Vue.onUpdated);
vi.stubGlobal("onBeforeUpdate", Vue.onBeforeUpdate);
vi.stubGlobal("provide", Vue.provide);
vi.stubGlobal("inject", Vue.inject);
vi.stubGlobal("nextTick", Vue.nextTick);
vi.stubGlobal("defineProps", Vue.defineProps);
vi.stubGlobal("defineEmits", Vue.defineEmits);
vi.stubGlobal("defineExpose", Vue.defineExpose);
vi.stubGlobal("withDefaults", Vue.withDefaults);
vi.stubGlobal("useSlots", Vue.useSlots);
vi.stubGlobal("useAttrs", Vue.useAttrs);

// Сбрасываем моки перед каждым тестом
beforeEach(() => {
  vi.clearAllMocks();
  mockRouterPush.mockResolvedValue(undefined);
  mockRoute.path = "/";
});
