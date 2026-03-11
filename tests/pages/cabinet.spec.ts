import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, reactive, ref } from "vue";
import CabinetPage from "~/pages/cabinet.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import {
  mockRouterPush,
  mockToastAdd as mockNuxtToastAdd,
} from "../mocks/nuxt";
import {
  createMockAuthStore,
  resetMockAuthStore,
  createMockBookingStore,
  resetMockBookingStore,
} from "../mocks/stores";

// Моки для auth и booking store
const mockAuthStore = createMockAuthStore();
const baseBookingStore = createMockBookingStore();
const mockBookingStore = {
  ...baseBookingStore,
  setCurrentBookingDetails: vi.fn(),
};

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

// Мок API
const mockPost = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    post: mockPost,
  }),
}));

// Мок кастомного toast (useNotificationToast)
const mockToastAdd = vi.fn();

vi.mock("~/composables/useToast", () => ({
  useNotificationToast: () => ({
    add: mockToastAdd,
  }),
}));

// Мок useUserProfile
const formData = reactive({
  name: "",
  surname: "",
  middle_name: "",
  phone: "",
  email: "",
  country: "",
});

const isLoadingProfile = ref(false);
const isSaving = ref(false);
const hasChanges = ref(false);
const checkChanges = vi.fn();
const saveChanges = vi.fn();
const fetchUserProfile = vi.fn();

vi.mock("~/composables/useUserProfile", () => ({
  useUserProfile: () => ({
    formData,
    isLoadingProfile,
    isSaving,
    hasChanges,
    checkChanges,
    saveChanges,
    fetchUserProfile,
  }),
}));

// Мок useBookingHistory
interface TestBookingHistoryItem {
  id: number | string;
  title?: string;
}

const bookingHistory = ref<TestBookingHistoryItem[]>([]);
const isLoadingBookings = ref(false);
const bookingsLoaded = ref(false);
const showLoadMoreButton = ref(false);
const loadMoreButtonLabel = ref("Загрузить ещё");
const fetchBookingHistory = vi.fn();
const handleLoadMoreClick = vi.fn();

vi.mock("~/composables/useBookingHistory", () => ({
  useBookingHistory: () => ({
    bookingHistory,
    isLoadingBookings,
    bookingsLoaded,
    showLoadMoreButton,
    loadMoreButtonLabel,
    fetchBookingHistory,
    handleLoadMoreClick,
  }),
}));

type CabinetVm = InstanceType<typeof CabinetPage>;

// Вспомогательная функция для монтирования страницы с нужными заглушками
const createWrapper = () =>
  mountComponent<CabinetVm>(CabinetPage, {
    global: {
      stubs: {
        CabinetNavigation: {
          template: '<nav data-testid="cabinet-navigation"></nav>',
        },
        CabinetPersonalData: {
          template: '<section data-testid="cabinet-personal"></section>',
          props: ["formData", "isLoading", "isSaving", "hasChanges"],
        },
        CabinetBookings: {
          template: '<section data-testid="cabinet-bookings"></section>',
          props: [
            "bookings",
            "isLoading",
            "bookingsLoaded",
            "showLoadMoreButton",
            "loadMoreButtonLabel",
          ],
        },
      },
    },
  });

describe("pages/cabinet.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    resetMockAuthStore(mockAuthStore);
    resetMockBookingStore(
      mockBookingStore as unknown as ReturnType<typeof createMockBookingStore>,
    );

    // Сбрасываем дополнительные поля booking store
    (
      mockBookingStore.setCurrentBookingDetails as ReturnType<typeof vi.fn>
    ).mockClear();

    // Сбрасываем состояние моков
    mockPost.mockReset();
    mockToastAdd.mockReset();
    mockNuxtToastAdd.mockReset();

    // Состояние composables
    bookingHistory.value = [];
    isLoadingBookings.value = false;
    bookingsLoaded.value = false;
    showLoadMoreButton.value = false;
    loadMoreButtonLabel.value = "Загрузить ещё";

    formData.name = "";
    formData.surname = "";
    formData.middle_name = "";
    formData.phone = "";
    formData.email = "";
    formData.country = "";

    isLoadingProfile.value = false;
    isSaving.value = false;
    hasChanges.value = false;
  });

  describe("Рендеринг", () => {
    it("должен отображать заголовок и раздел персональных данных по умолчанию", () => {
      const wrapper = createWrapper();

      const header = wrapper.find("h1");
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe("Личный кабинет");

      expect(wrapper.find('[data-testid="cabinet-navigation"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="cabinet-personal"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="cabinet-bookings"]').exists()).toBe(
        false,
      );
    });

    it("должен переключать разделы между персональными данными и бронированиями", async () => {
      const wrapper = createWrapper();

      // По умолчанию активен раздел персональных данных
      expect(wrapper.find('[data-testid="cabinet-personal"]').exists()).toBe(
        true,
      );

      await (wrapper.vm as CabinetVm).handleSectionChange("bookings");
      await nextTick();

      expect(wrapper.find('[data-testid="cabinet-bookings"]').exists()).toBe(
        true,
      );
    });
  });

  describe("Переключение разделов и загрузка истории бронирований", () => {
    it("должен загружать историю бронирований при первом переходе в раздел бронирований", async () => {
      const wrapper = createWrapper();

      bookingsLoaded.value = false;

      await (wrapper.vm as CabinetVm).handleSectionChange("bookings");

      expect((wrapper.vm as CabinetVm).activeSection).toBe("bookings");
      expect(fetchBookingHistory).toHaveBeenCalledWith(true);
    });

    it("не должен повторно загружать историю, если она уже загружена", async () => {
      const wrapper = createWrapper();

      bookingsLoaded.value = true;

      await (wrapper.vm as CabinetVm).handleSectionChange("bookings");

      expect(fetchBookingHistory).not.toHaveBeenCalled();
    });
  });

  describe("Просмотр деталей бронирования", () => {
    it("должен устанавливать детали бронирования и переходить на страницу деталей", async () => {
      bookingHistory.value = [
        { id: 1, title: "Бронь 1" },
        { id: 2, title: "Бронь 2" },
      ];

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).viewBookingDetails(1);

      expect(mockBookingStore.setCurrentBookingDetails).toHaveBeenCalledWith(
        bookingHistory.value[0],
      );
      expect(mockRouterPush).toHaveBeenCalledWith("/booking-details?id=1");
    });

    it("должен сбрасывать детали бронирования, если запись не найдена", async () => {
      bookingHistory.value = [];

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).viewBookingDetails(42);

      expect(mockBookingStore.setCurrentBookingDetails).toHaveBeenCalledWith(
        null,
      );
      expect(mockRouterPush).toHaveBeenCalledWith("/booking-details?id=42");
    });
  });

  describe("Обновление данных формы профиля", () => {
    it("должен обновлять formData при вызове handleFormDataUpdate", async () => {
      formData.name = "Иван";

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).handleFormDataUpdate({
        name: "Петр",
      });

      expect(formData.name).toBe("Петр");
    });
  });

  describe("Создание нового бронирования", () => {
    it("должен перенаправлять на главную страницу при создании нового бронирования", async () => {
      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).handleNewBooking();

      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  describe("Выход из аккаунта", () => {
    it("должен корректно обрабатывать успешный выход", async () => {
      mockAuthStore.user = {
        id: 1,
        email: "user@example.com",
        name: "User",
        surname: "Test",
        phone: "+7 000 000-00-00",
        country: "RU",
      } as const as typeof mockAuthStore.user;

      mockPost.mockResolvedValue({
        success: true,
        message: "OK",
      });

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).handleLogout();

      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockAuthStore.setError).toHaveBeenCalledWith(null);
      expect(mockPost).toHaveBeenCalledWith("/v1/auth/logout");
      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
      expect(mockAuthStore.setLoading).toHaveBeenLastCalledWith(false);
      // Ошибочный toast не должен вызываться при успешном выходе
      expect(mockToastAdd).not.toHaveBeenCalled();
    });

    it("должен показывать toast при неуспешном ответе API", async () => {
      mockAuthStore.user = {
        id: 1,
        email: "user@example.com",
        name: "User",
        surname: "Test",
        phone: "+7 000 000-00-00",
        country: "RU",
      } as const as typeof mockAuthStore.user;

      mockPost.mockResolvedValue({
        success: false,
        message: "Ошибка выхода",
      });

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).handleLogout();

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "Ошибка выхода",
        detail: "Ошибка выхода",
        life: 5000,
      });
    });

    it("должен обрабатывать ошибки при запросе выхода", async () => {
      mockAuthStore.user = {
        id: 1,
        email: "user@example.com",
        name: "User",
        surname: "Test",
        phone: "+7 000 000-00-00",
        country: "RU",
      } as const as typeof mockAuthStore.user;

      const error = new Error("Сетевая ошибка");
      mockPost.mockRejectedValue(error);

      const wrapper = createWrapper();

      await (wrapper.vm as CabinetVm).handleLogout();

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "Ошибка выхода",
        }),
      );
    });
  });

  describe("onMounted логика", () => {
    it("должен сбрасывать состояние загрузки бронирований при монтировании", async () => {
      mockBookingStore.isServerRequest = true;

      const _wrapper = createWrapper();
      await nextTick();

      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockBookingStore.isServerRequest).toBe(false);
    });

    it("должен загружать профиль пользователя, если он есть в authStore", async () => {
      mockAuthStore.user = {
        id: 10,
        email: "user@example.com",
        name: "User",
        surname: "Test",
        phone: "+7 000 000-00-00",
        country: "RU",
      } as const as typeof mockAuthStore.user;

      const _wrapper = createWrapper();
      await nextTick();

      expect(fetchUserProfile).toHaveBeenCalled();
    });
  });
});
