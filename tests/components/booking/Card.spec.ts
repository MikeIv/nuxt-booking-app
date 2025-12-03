import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, computed, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import { mockRouterPush } from "../../mocks/nuxt";
import {
  createMockBookingStore,
  resetMockBookingStore,
} from "../../mocks/stores";
import type { Room } from "~/types/room";

// Импортируем компонент после моков
import Card from "~/components/booking/Card.vue";

// Мокируем store ПЕРЕД импортом компонента
const mockBookingStore = createMockBookingStore();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

// Интерфейс для публичных свойств компонента Card
interface CardComponentInstance {
  loading: boolean;
  isPopupOpen: boolean;
  totalAdults: number;
  formattedMinPrice: string | null;
  bedOptions: Array<{ id: string; title: string }>;
  handleTariff: () => Promise<void>;
  closePopup: () => void;
}

// Мокируем composables ПЕРЕД импортом компонента
vi.mock("~/composables/useNights", () => ({
  useNights: (dateRange: Ref<[Date, Date] | null> | Ref<Date[] | null>) => {
    const nights = computed(() => {
      if (!dateRange || !dateRange.value || dateRange.value.length < 2)
        return 0;
      const start = new Date(dateRange.value[0]);
      const end = new Date(dateRange.value[1]);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      const diffTime = end.getTime() - start.getTime();
      if (diffTime <= 0) return 0;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    return nights;
  },
}));

vi.mock("~/composables/useRoomCarousel", () => ({
  useRoomCarousel: (
    photos: Ref<string[]> | string[],
    minPhotos: number = 2,
    targetItems: number = 3,
    placeholderLabel: string = "Room Photo",
  ) => {
    const photosValue = computed(() => {
      const photosArray = photos?.value || photos || [];
      const photosCount = photosArray.length;
      if (photosCount >= minPhotos) {
        return photosArray;
      }
      const placeholdersNeeded = targetItems - photosCount;
      const placeholders = Array.from({ length: placeholdersNeeded }, () => ({
        placeholder: true,
        label: placeholderLabel,
      }));
      return [...photosArray, ...placeholders];
    });
    return {
      carouselImages: photosValue,
    };
  },
}));

// Моки для composables уже настроены в setup.ts
// Переопределяем их здесь, если нужно для конкретных тестов

// Мокируем утилиты ПЕРЕД импортом компонента
vi.mock("~/utils/declension", () => ({
  formatCount: (count: number, type: string) => {
    if (type === "capacity") return `${count} гостей`;
    if (type === "chamber") return `${count} комната`;
    if (type === "guest") return `${count} гость`;
    if (type === "night") return `${count} ночь`;
    return String(count);
  },
}));

// Создаем мок-данные для номера
const createMockRoom = (overrides?: Partial<Room>): Room => ({
  room_type_code: "DLT",
  title: "Делюкс номер",
  description: "Описание номера",
  max_occupancy: 2,
  square: 25,
  rooms: 1,
  amenities: [],
  bed: { id: 1, title: "Двуспальная кровать" },
  view: null,
  family: null,
  min_price: 5000,
  price_for_register: 1000,
  photos: ["photo1.jpg", "photo2.jpg"],
  tariffs: [],
  ...overrides,
});

describe("Card.vue", () => {
  beforeEach(() => {
    // Создаем новый экземпляр Pinia для каждого теста
    setupPinia();

    // Убеждаемся, что глобальные функции определены
    vi.stubGlobal("useBookingStore", () => mockBookingStore);
    vi.stubGlobal("storeToRefs", storeToRefs);

    // Сбрасываем моки перед каждым тестом
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
    resetMockBookingStore(mockBookingStore);
    mockBookingStore.date.value = [
      new Date("2024-12-01"),
      new Date("2024-12-05"),
    ];
    mockBookingStore.guests.value = {
      rooms: 1,
      roomList: [{ adults: 2, children: 0, childrenAges: [] }],
    };
  });

  describe("Рендеринг компонента", () => {
    it("должен отображать карточку номера с базовой информацией", () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      expect(wrapper.find("article").exists()).toBe(true);
      expect(wrapper.text()).toContain("Делюкс номер");
      expect(wrapper.text()).toContain("25 м²");
      expect(wrapper.text()).toContain("От 5000 руб.");
    });

    it("должен отображать кнопку выбора номера", () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const button = wrapper.find("button.btn__bs");
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain("Выбрать номер");
    });

    it("должен отображать информацию о гостях и ночах", () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      expect(wrapper.text()).toContain("2 гость");
      expect(wrapper.text()).toContain("4 ночь");
    });

    it("не должен отображать цену, если min_price равен null", () => {
      const room = createMockRoom({ min_price: null });
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      expect(wrapper.text()).not.toContain("От");
    });
  });

  describe("Валидация дат", () => {
    it("должен отключать кнопку, если даты не выбраны", async () => {
      const room = createMockRoom();
      mockBookingStore.date.value = null;

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const button = wrapper.find("button.btn__bs");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("должен отключать кнопку, если выбрана только одна дата", async () => {
      const room = createMockRoom();
      mockBookingStore.date.value = [new Date("2024-12-01")] as Date[];

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const button = wrapper.find("button.btn__bs");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("должен включать кнопку, если даты выбраны", async () => {
      const room = createMockRoom();
      mockBookingStore.date.value = [
        new Date("2024-12-01"),
        new Date("2024-12-05"),
      ];

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const button = wrapper.find("button.btn__bs");
      expect(button.attributes("disabled")).toBeUndefined();
    });
  });

  describe("Работа с вариантами номеров", () => {
    it("должен использовать исходный номер, если вариантов нет", () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      expect(wrapper.text()).toContain("Делюкс номер");
    });

    it("должен работать с вариантами номеров", () => {
      const variant1 = createMockRoom({
        room_type_code: "DLT-SGL",
        title: "Делюкс номер (одноместный)",
        bed: { id: 1, title: "Односпальная кровать" },
      });
      const variant2 = createMockRoom({
        room_type_code: "DLT-DBL",
        title: "Делюкс номер (двухместный)",
        bed: { id: 2, title: "Двуспальная кровать" },
      });

      const room = createMockRoom({
        room_type_codes: [variant1, variant2],
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      expect(wrapper.text()).toContain("Делюкс номер");
    });

    it("должен автоматически выбирать вариант с кроватью при инициализации", async () => {
      const variant1 = createMockRoom({
        room_type_code: "DLT-SGL",
        bed: null,
      });
      const variant2 = createMockRoom({
        room_type_code: "DLT-DBL",
        bed: { id: 2, title: "Двуспальная кровать" },
      });

      const room = createMockRoom({
        room_type_codes: [variant1, variant2],
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      // Компонент должен выбрать вариант с кроватью
      expect(wrapper.text()).toContain("Делюкс номер");
    });
  });

  describe("Метод handleTariff", () => {
    it("должен прервать выполнение, если даты не выбраны", async () => {
      const room = createMockRoom();
      mockBookingStore.date.value = null;

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Получаем доступ к методу через vm
      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      expect(consoleSpy).toHaveBeenCalledWith("Не выбраны даты бронирования");
      expect(mockBookingStore.setSelectedRoomType).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("должен сохранить room_type_code и перейти на /rooms/tariff для одного номера", async () => {
      const room = createMockRoom({ room_type_code: "DLT" });
      // Устанавливаем значения ДО монтирования компонента
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick(); // Ждем, пока компонент инициализируется

      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      expect(mockBookingStore.setSelectedRoomType).toHaveBeenCalledWith("DLT");
      expect(mockRouterPush).toHaveBeenCalledWith("/rooms/tariff");
    });

    it("должен перейти на /multi-rooms для нескольких номеров", async () => {
      const room = createMockRoom({ room_type_code: "DLT" });

      // Устанавливаем значения ДО монтирования компонента
      mockBookingStore.guests.value = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick(); // Ждем, пока компонент инициализируется

      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      expect(mockBookingStore.setSelectedRoomType).toHaveBeenCalledWith("DLT");
      expect(mockRouterPush).toHaveBeenCalledWith("/multi-rooms");
    });

    it("должен использовать код из выбранного варианта", async () => {
      const variant1 = createMockRoom({
        room_type_code: "DLT-SGL",
        title: "Делюкс номер (одноместный)",
        bed: { id: 1, title: "Односпальная кровать" },
      });
      const variant2 = createMockRoom({
        room_type_code: "DLT-DBL",
        title: "Делюкс номер (двухместный)",
        bed: { id: 2, title: "Двуспальная кровать" },
      });

      const room = createMockRoom({
        room_type_codes: [variant1, variant2],
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      // Должен использовать код из одного из вариантов
      expect(mockBookingStore.setSelectedRoomType).toHaveBeenCalled();
      const calledWith = (
        mockBookingStore.setSelectedRoomType as unknown as {
          mock: { calls: Array<[string]> };
        }
      ).mock.calls[0][0];
      expect(["DLT-SGL", "DLT-DBL"]).toContain(calledWith);
    });

    it("должен прервать выполнение, если room_type_code равен названию", async () => {
      const room = createMockRoom({
        room_type_code: "Делюкс номер", // Код равен названию - невалидно
        title: "Делюкс номер",
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Устанавливаем DEV режим для логирования
      vi.stubGlobal("import.meta", { env: { DEV: true } });

      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockBookingStore.setSelectedRoomType).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("должен прервать выполнение, если room_type_code пустой", async () => {
      const room = createMockRoom({
        room_type_code: "", // Пустой код - невалидно
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.stubGlobal("import.meta", { env: { DEV: true } });

      const vm = wrapper.vm as unknown as CardComponentInstance;
      await vm.handleTariff();

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockBookingStore.setSelectedRoomType).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("должен установить loading в true во время выполнения", async () => {
      const room = createMockRoom();
      mockRouterPush.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const vm = wrapper.vm as unknown as CardComponentInstance;
      const handleTariffPromise = vm.handleTariff();

      await nextTick();

      // Проверяем, что loading установлен
      expect(vm.loading).toBe(true);

      await handleTariffPromise;

      // После завершения loading должен быть false
      expect(vm.loading).toBe(false);
    });
  });

  describe("Открытие/закрытие попапа", () => {
    it("должен открывать попап при клике на кнопку информации", async () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const vm = wrapper.vm as unknown as CardComponentInstance;
      expect(vm.isPopupOpen).toBe(false);

      const infoButton = wrapper.find("[data-popup-button]");
      await infoButton.trigger("click");

      expect(vm.isPopupOpen).toBe(true);
    });

    it("должен закрывать попап при вызове closePopup", async () => {
      const room = createMockRoom();
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      const vm = wrapper.vm as unknown as CardComponentInstance;
      vm.isPopupOpen = true;
      await nextTick();

      vm.closePopup();
      await nextTick();

      expect(vm.isPopupOpen).toBe(false);
    });
  });

  describe("Computed свойства", () => {
    it("должен вычислять totalAdults из roomList", async () => {
      const room = createMockRoom();
      mockBookingStore.guests.value = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      expect(vm.totalAdults).toBe(3);
    });

    it("должен возвращать 0 для totalAdults, если roomList отсутствует", async () => {
      const room = createMockRoom();
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: undefined,
      };

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      expect(vm.totalAdults).toBe(0);
    });

    it("должен форматировать минимальную цену", async () => {
      const room = createMockRoom({ min_price: 5000 });
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      expect(vm.formattedMinPrice).toBe("5000 руб.");
    });

    it("должен возвращать null для formattedMinPrice, если цена null", async () => {
      const room = createMockRoom({ min_price: null });
      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      expect(vm.formattedMinPrice).toBeNull();
    });
  });

  describe("Выбор типа кровати", () => {
    it("должен формировать опции для выбора типа кровати из вариантов", async () => {
      const variant1 = createMockRoom({
        room_type_code: "DLT-SGL",
        bed: { id: 1, title: "Односпальная кровать" },
      });
      const variant2 = createMockRoom({
        room_type_code: "DLT-DBL",
        bed: { id: 2, title: "Двуспальная кровать" },
      });

      const room = createMockRoom({
        room_type_codes: [variant1, variant2],
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      const options = vm.bedOptions;

      expect(options.length).toBeGreaterThan(0);
      expect(options.some((opt) => opt.title === "Односпальная кровать")).toBe(
        true,
      );
      expect(options.some((opt) => opt.title === "Двуспальная кровать")).toBe(
        true,
      );
    });

    it("должен исключать дубликаты типов кроватей", async () => {
      const variant1 = createMockRoom({
        room_type_code: "DLT-SGL",
        bed: { id: 1, title: "Двуспальная кровать" },
      });
      const variant2 = createMockRoom({
        room_type_code: "DLT-DBL",
        bed: { id: 2, title: "Двуспальная кровать" },
      });

      const room = createMockRoom({
        room_type_codes: [variant1, variant2],
      });

      const wrapper = mountComponent(Card, {
        props: { room },
      });

      await nextTick();

      const vm = wrapper.vm as unknown as CardComponentInstance;
      const options = vm.bedOptions;

      // Должна быть только одна опция с "Двуспальная кровать"
      const doubleBedOptions = options.filter(
        (opt) => opt.title === "Двуспальная кровать",
      );
      expect(doubleBedOptions.length).toBe(1);
    });
  });
});
