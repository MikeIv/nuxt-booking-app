/**
 * Моки для Pinia stores
 */
import { ref } from "vue";
import { vi } from "vitest";

/**
 * Создает мок для booking store
 */
export function createMockBookingStore() {
  const isServerRequestRef = ref(false);

  return {
    date: ref<[Date, Date] | null>(null),
    guests: ref({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    }),
    promoCode: ref(""),
    loading: ref(false),
    // Используем геттер/сеттер для поддержки прямой записи
    get isServerRequest() {
      return isServerRequestRef;
    },
    set isServerRequest(value: boolean) {
      isServerRequestRef.value = value;
    },
    setLoading: vi.fn(),
    search: vi.fn().mockResolvedValue({}),
  };
}

/**
 * Сбрасывает мок booking store к начальным значениям
 */
export function resetMockBookingStore(
  store: ReturnType<typeof createMockBookingStore>,
) {
  store.date.value = null;
  store.guests.value = {
    rooms: 1,
    roomList: [{ adults: 1, children: 0, childrenAges: [] }],
  };
  store.promoCode.value = "";
  store.loading.value = false;
  // Используем сеттер для установки значения
  store.isServerRequest = false;
  store.setLoading.mockClear();
  store.search.mockResolvedValue({});
}
