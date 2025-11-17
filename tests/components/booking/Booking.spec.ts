import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import Booking from "~/components/booking/Booking.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import { mockRouterPush, mockRoute, mockToastAdd } from "../../mocks/nuxt";
import {
  createMockBookingStore,
  resetMockBookingStore,
} from "../../mocks/stores";

// Мокируем store
const mockBookingStore = createMockBookingStore();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

describe("Booking.vue", () => {
  beforeEach(() => {
    // Создаем новый экземпляр Pinia для каждого теста
    setupPinia();

    // Сбрасываем моки перед каждым тестом
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
    mockRoute.path = "/";
    resetMockBookingStore(mockBookingStore);
  });

  describe("Валидация формы", () => {
    it("должен показывать ошибку, если даты не выбраны", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = null;
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };

      await wrapper.vm.validateForm();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, выберите даты",
        life: 3000,
      });
    });

    it("должен показывать ошибку, если количество взрослых равно 0", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 0, children: 0, childrenAges: [] }],
      };

      await wrapper.vm.validateForm();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, укажите количество взрослых",
        life: 3000,
      });
    });

    it("должен проходить валидацию при корректных данных", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };

      const result = await wrapper.vm.validateForm();

      expect(result).toBe(true);
      expect(mockToastAdd).not.toHaveBeenCalled();
    });
  });

  describe("Обработка поиска", () => {
    it("должен вызывать search и делать редирект на /rooms для одного номера", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      mockBookingStore.search.mockResolvedValue({});

      await wrapper.vm.handleSearch();

      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(
        true,
        "Загружаем данные о номерах...",
      );
      expect(mockBookingStore.search).toHaveBeenCalledWith(true);
      expect(mockRouterPush).toHaveBeenCalledWith("/rooms");
      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockBookingStore.isServerRequest.value).toBe(false);
    });

    it("должен делать редирект на /multi-rooms для нескольких номеров", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      mockBookingStore.search.mockResolvedValue({});

      await wrapper.vm.handleSearch();

      expect(mockRouterPush).toHaveBeenCalledWith("/multi-rooms");
    });

    it("не должен делать редирект, если уже на нужной странице", async () => {
      const wrapper = mountComponent(Booking);

      mockRoute.path = "/rooms";
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      mockBookingStore.search.mockResolvedValue({});

      await wrapper.vm.handleSearch();

      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("должен обрабатывать ошибки при поиске", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const error = {
        status: 500,
        message: "Серверная ошибка",
      };
      mockBookingStore.search.mockRejectedValue(error);

      await wrapper.vm.handleSearch();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "warn",
        summary: "Ошибка 500",
        detail: "Серверная ошибка",
        life: 3000,
      });
      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockBookingStore.isServerRequest.value).toBe(false);
    });

    it("не должен выполнять поиск, если валидация не прошла", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.date.value = null;

      await wrapper.vm.handleSearch();

      expect(mockBookingStore.search).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe("Рендеринг компонента", () => {
    it("должен отображать форму с полями", () => {
      const wrapper = mountComponent(Booking);

      expect(wrapper.find('[data-testid="date-picker"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="guests-selector"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="promo-code-input"]').exists()).toBe(
        true,
      );
    });

    it("должен отображать кнопку поиска", () => {
      const wrapper = mountComponent(Booking);

      const button = wrapper.find("button");
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe("Поиск");
    });

    it("должен показывать 'Поиск...' когда loading = true", async () => {
      const wrapper = mountComponent(Booking);

      mockBookingStore.loading.value = true;
      await nextTick();

      const button = wrapper.find("button");
      expect(button.text()).toBe("Поиск...");
    });
  });
});
