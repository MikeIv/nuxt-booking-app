/**
 * Моки для Pinia stores
 */
import { ref } from "vue";
import { vi } from "vitest";
import type { SearchResponse } from "~/types/booking";
import type { UserProfile } from "~/types/auth";

/**
 * Создает мок для booking store
 */
export function createMockBookingStore() {
  const isServerRequestRef = ref(false);
  const searchResultsRef = ref<SearchResponse | null>(null);
  const guestsRef = ref({
    rooms: 1,
    roomList: [{ adults: 1, children: 0, childrenAges: [] }],
  });

  return {
    date: ref<[Date, Date] | null>(null),
    // guests должен быть ref для работы с storeToRefs
    guests: guestsRef,
    promoCode: ref(""),
    loading: ref(false),
    searchResults: searchResultsRef,
    // Используем геттер/сеттер для поддержки прямой записи
    get isServerRequest() {
      return isServerRequestRef;
    },
    set isServerRequest(value: boolean) {
      isServerRequestRef.value = value;
    },
    setLoading: vi.fn(),
    search: vi.fn().mockResolvedValue({}),
    setSelectedRoomType: vi.fn(),
  };
}

/**
 * Сбрасывает мок booking store к начальным значениям
 */
export function resetMockBookingStore(
  store: ReturnType<typeof createMockBookingStore>,
) {
  store.date.value = null;
  // guests теперь ref, поэтому используем .value
  store.guests.value = {
    rooms: 1,
    roomList: [{ adults: 1, children: 0, childrenAges: [] }],
  };
  store.promoCode.value = "";
  store.loading.value = false;
  store.searchResults.value = null;
  // Используем сеттер для установки значения
  store.isServerRequest = false;
  store.setLoading.mockClear();
  store.search.mockResolvedValue({});
  (store.setSelectedRoomType as ReturnType<typeof vi.fn>).mockClear();
}

/**
 * Создает мок для auth store
 */
export function createMockAuthStore() {
  return {
    user: null as UserProfile | null,
    loading: ref(false),
    error: ref(null),
    setUser: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    logout: vi.fn(),
  };
}

/**
 * Сбрасывает мок auth store к начальным значениям
 */
export function resetMockAuthStore(
  store: ReturnType<typeof createMockAuthStore>,
) {
  store.user = null;
  store.loading.value = false;
  store.error.value = null;
  store.setUser.mockClear();
  store.setLoading.mockClear();
  store.setError.mockClear();
  store.logout.mockClear();
}
