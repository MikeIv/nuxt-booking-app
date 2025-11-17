import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import RoomsPage from "~/pages/rooms/index.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import { mockRouterPush, mockToastAdd } from "../../mocks/nuxt";
import {
  createMockBookingStore,
  resetMockBookingStore,
} from "../../mocks/stores";
import type { Room } from "~/types/room";

// Мокируем store
const mockBookingStore = createMockBookingStore();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

// Создаем тестовые данные
const createMockRoom = (overrides?: Partial<Room>): Room => ({
  room_type_code: "TEST-001",
  title: "Тестовый номер",
  description: "Описание",
  max_occupancy: 2,
  square: 25,
  rooms: 1,
  amenities: [],
  min_price: 5000,
  photos: [],
  tariffs: [],
  ...overrides,
});

const createMockView = (id: number, title: string) => ({ id, title });

describe("pages/rooms/index.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
    resetMockBookingStore(mockBookingStore);
  });

  describe("Рендеринг компонента", () => {
    it("должен отображать заголовок страницы", () => {
      const wrapper = mountComponent(RoomsPage);
      const header = wrapper.find("h1");
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe("Выбор номера");
    });

    it("должен отображать компонент Booking", () => {
      const wrapper = mountComponent(RoomsPage);
      expect(wrapper.find('[data-testid="booking-component"]').exists()).toBe(
        true,
      );
    });

    it("должен отображать фильтры", () => {
      const wrapper = mountComponent(RoomsPage);
      const filtersWrapper = wrapper.find('[data-testid="filters-wrapper"]');
      expect(filtersWrapper.exists()).toBe(true);
    });

    it("должен показывать сообщение о загрузке когда loading = true", async () => {
      mockBookingStore.loading.value = true;
      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      const loading = wrapper.find('[data-testid="loading"]');
      expect(loading.exists()).toBe(true);
      expect(loading.text()).toBe("Загрузка номеров...");
    });

    it("должен показывать сообщение об отсутствии результатов когда нет данных", async () => {
      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = null;
      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      const noResults = wrapper.find('[data-testid="no-results"]');
      expect(noResults.exists()).toBe(true);
      expect(noResults.text()).toBe("Нет доступных номеров. Выполните поиск.");
    });
  });

  describe("Отображение номеров", () => {
    it("должен отображать список номеров когда есть результаты", async () => {
      const rooms: Room[] = [
        createMockRoom({ room_type_code: "ROOM-1", title: "Номер 1" }),
        createMockRoom({ room_type_code: "ROOM-2", title: "Номер 2" }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(2);
      expect(cards[0].text()).toBe("Номер 1");
      expect(cards[1].text()).toBe("Номер 2");
    });

    it("должен показывать сообщение когда фильтры не дают результатов", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          view: createMockView(1, "Парк"),
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      // Устанавливаем фильтр на вид, которого нет в номерах
      wrapper.vm.selectedView = 2; // Город
      await nextTick();

      const noFilterResults = wrapper.find('[data-testid="no-filter-results"]');
      expect(noFilterResults.exists()).toBe(true);
      expect(noFilterResults.text()).toBe(
        "Нет номеров с выбранными параметрами",
      );
    });
  });

  describe("Фильтрация по виду", () => {
    it("должен фильтровать номера по выбранному виду", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с видом на парк",
          view: createMockView(1, "Парк"),
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          title: "Номер с видом на город",
          view: createMockView(2, "Город"),
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      // Выбираем вид "Парк" (id: 1)
      wrapper.vm.selectedView = 1;
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
      expect(cards[0].text()).toBe("Номер с видом на парк");
    });

    it("должен фильтровать номера по виду из вариантов", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с вариантами",
          view: null,
          room_type_codes: [
            createMockRoom({
              room_type_code: "VAR-1",
              view: createMockView(3, "Море"),
            }),
          ],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      wrapper.vm.selectedView = 3; // Море
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
    });

    it("должен показывать все номера когда вид не выбран (id: 0)", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          view: createMockView(1, "Парк"),
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          view: createMockView(2, "Город"),
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(2);
    });
  });

  describe("Фильтрация по балкону", () => {
    it("должен фильтровать номера с балконом", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с балконом",
          amenities: [{ title: "Балкон" }],
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          title: "Номер без балкона",
          amenities: [],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      // Выбираем "Есть балкон" (id: 1)
      wrapper.vm.selectedBalcony = 1;
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
      expect(cards[0].text()).toBe("Номер с балконом");
    });

    it("должен фильтровать номера без балкона", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с балконом",
          amenities: [{ title: "Балкон" }],
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          title: "Номер без балкона",
          amenities: [],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      // Выбираем "Нет балкона" (id: 2)
      wrapper.vm.selectedBalcony = 2;
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
      expect(cards[0].text()).toBe("Номер без балкона");
    });

    it("должен находить балкон в вариантах номеров", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с балконом в варианте",
          amenities: [],
          room_type_codes: [
            createMockRoom({
              room_type_code: "VAR-1",
              amenities: [{ title: "Балкон" }],
            }),
          ],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      wrapper.vm.selectedBalcony = 1; // Есть балкон
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
    });

    it("должен показывать все номера когда балкон не выбран (id: 0)", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          amenities: [{ title: "Балкон" }],
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          amenities: [],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(2);
    });
  });

  describe("Комбинированная фильтрация", () => {
    it("должен применять оба фильтра одновременно", async () => {
      const rooms: Room[] = [
        createMockRoom({
          room_type_code: "ROOM-1",
          title: "Номер с балконом и видом на парк",
          view: createMockView(1, "Парк"),
          amenities: [{ title: "Балкон" }],
        }),
        createMockRoom({
          room_type_code: "ROOM-2",
          title: "Номер с балконом, но без вида на парк",
          view: createMockView(2, "Город"),
          amenities: [{ title: "Балкон" }],
        }),
        createMockRoom({
          room_type_code: "ROOM-3",
          title: "Номер с видом на парк, но без балкона",
          view: createMockView(1, "Парк"),
          amenities: [],
        }),
      ];

      mockBookingStore.loading.value = false;
      mockBookingStore.searchResults.value = {
        rooms,
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      wrapper.vm.selectedView = 1; // Парк
      wrapper.vm.selectedBalcony = 1; // Балкон
      await nextTick();

      const cards = wrapper.findAll('[data-testid="booking-card"]');
      expect(cards.length).toBe(1);
      expect(cards[0].text()).toBe("Номер с балконом и видом на парк");
    });
  });

  describe("onMounted логика", () => {
    it("должен перенаправлять на главную если нет дат", async () => {
      mockBookingStore.date.value = null;
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };

      const _wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });

    it("должен перенаправлять на главную если нет взрослых", async () => {
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 0, children: 0, childrenAges: [] }],
      };

      const _wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });

    it("должен вызывать search если нет результатов", async () => {
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      mockBookingStore.searchResults.value = null;
      mockBookingStore.search.mockResolvedValue({
        rooms: [],
        packages: [],
        available: true,
        groupedByBed: false,
      });

      const _wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(mockBookingStore.search).toHaveBeenCalled();
    });

    it("не должен вызывать search если результаты уже есть", async () => {
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      mockBookingStore.searchResults.value = {
        rooms: [createMockRoom()],
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const _wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(mockBookingStore.search).not.toHaveBeenCalled();
    });

    it("должен обрабатывать ошибки при поиске", async () => {
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      mockBookingStore.searchResults.value = null;
      const error = new Error("Ошибка сети");
      mockBookingStore.search.mockRejectedValue(error);

      const _wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "Ошибка загрузки",
        detail: "Ошибка сети",
        life: 3000,
      });
      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockBookingStore.isServerRequest.value).toBe(false);
    });
  });

  describe("Computed свойства", () => {
    it("должен правильно вычислять totalAdults", async () => {
      mockBookingStore.guests.value = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      // totalAdults должен быть 3 (2 + 1)
      expect(wrapper.vm.totalAdults).toBe(3);
    });

    it("должен возвращать 0 для totalAdults если нет roomList", async () => {
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [],
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(wrapper.vm.totalAdults).toBe(0);
    });

    it("должен правильно определять hasSearchResults", async () => {
      mockBookingStore.searchResults.value = {
        rooms: [createMockRoom()],
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(wrapper.vm.hasSearchResults).toBe(true);
    });

    it("должен возвращать false для hasSearchResults если нет номеров", async () => {
      mockBookingStore.searchResults.value = {
        rooms: [],
        packages: [],
        available: true,
        groupedByBed: false,
      };

      const wrapper = mountComponent(RoomsPage);
      await nextTick();

      expect(wrapper.vm.hasSearchResults).toBe(false);
    });
  });
});
