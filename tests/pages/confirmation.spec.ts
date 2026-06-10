import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
import ConfirmationPage from "~/pages/confirmation.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import { mockRouterPush, mockRoute, mockToastAdd } from "../mocks/nuxt";

// Типы для тестовых данных
type TestOrder = {
  name?: string;
  surname?: string;
  nationality?: string;
  comment?: string | null;
  payment_cancelled?: string | null;
  start_at?: string;
  end_at?: string;
  nights?: number;
  pdf?: string | null;
  email?: string;
};

type TestBooking = {
  id: number;
  uuid?: string;
  number: string;
  confirmation_number?: string | null;
  status: string;
  allowed?: string[];
  order: TestOrder;
  rooms: unknown[];
  total_price: number;
  payment: unknown | null;
};

const createdBookingRef = ref<TestBooking | null>(null);
const loadingRef = ref(false);
const isServerRequestRef = ref(false);

const mockBookingStore = {
  selectedRoomType: ref<string | null>(null),
  selectedTariff: ref<unknown | null>(null),
  roomTariffs: ref<unknown[]>([]),
  date: ref<[Date, Date] | null>(null),
  selectedServices: ref<unknown[]>([]),
  loading: loadingRef,
  get isServerRequest() {
    return isServerRequestRef.value;
  },
  set isServerRequest(value: boolean) {
    isServerRequestRef.value = value;
  },
  createdBooking: createdBookingRef,
  currentBookingUuid: ref<string | null>(null),
  error: null as string | null,
  guests: {
    rooms: 1,
    roomList: [],
  },
  setLoading: vi.fn(),
  setServerRequest: vi.fn((value: boolean) => {
    isServerRequestRef.value = value;
  }),
  setGuests: vi.fn(),
  getBookingByUuid: vi.fn(),
  getSessionBookingByUuid: vi.fn().mockReturnValue(null),
  setBookingByUuid: vi.fn(),
  forceReset: vi.fn(),
  getSelectedServicesForRoom: vi.fn().mockReturnValue([]),
  formatDate: vi.fn((d: Date) => d.toISOString().split("T")[0]),
  search: vi.fn().mockResolvedValue({ available: false, rooms: [] }),
};

const mockAuthStore = {
  isAuthenticated: false,
  user: null as { email?: string } | null,
};

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

// confirmation.vue явно импортирует storeToRefs из pinia.
// Pinia's storeToRefs падает на non-Ref полях мок-объекта (error: null → null.effect).
// Переопределяем: для mock-стора (без $id) просто возвращаем его как есть.
vi.mock("pinia", async () => {
  const mod = await vi.importActual<typeof import("pinia")>("pinia");
  return {
    ...mod,
    storeToRefs: (store: unknown) => {
      if (store && typeof store === "object" && "$id" in (store as object)) {
        return mod.storeToRefs(store as Parameters<typeof mod.storeToRefs>[0]);
      }
      return store;
    },
  };
});

// Мок тоста — переопределяем глобальный стаб из setup.ts
const mockNotificationToastAdd = vi.fn();
vi.stubGlobal("useNotificationToast", () => ({
  add: mockNotificationToastAdd,
}));

vi.stubGlobal("useBookingAccessDenied", () => ({
  handleBookingAccessDenied: vi.fn().mockResolvedValue(undefined),
  handleBookingAccessDeniedIfNeeded: vi.fn().mockResolvedValue(false),
}));

// Стабы для проектных composables, используемых как авто-импорты в confirmation.vue
vi.stubGlobal("useConfirmationQR", () => ({ qrCanvas: ref(null) }));

const mockIsBookingConfirmed = ref(true);
const mockIsBookingFailed = ref(false);
const mockIsAwaitingConfirmation = ref(false);

vi.stubGlobal("useBookingStatusPolling", () => ({
  pageStatus: ref("confirmed"),
  isAwaitingConfirmation: mockIsAwaitingConfirmation,
  isBookingConfirmed: mockIsBookingConfirmed,
  isBookingFailed: mockIsBookingFailed,
  showConfirmationContent: computed(
    () => !mockIsAwaitingConfirmation.value && !mockIsBookingFailed.value,
  ),
}));

vi.stubGlobal("useBookingCancel", () => ({
  isCancelBookingPopupOpen: ref(false),
  isCancellingBooking: ref(false),
  cancelBookingError: ref<string | null>(null),
  openCancelBookingPopup: vi.fn(),
  closeCancelBookingPopup: vi.fn(),
  confirmCancelBooking: vi.fn(),
}));

vi.stubGlobal("useBookingChangeContacts", () => ({
  isChangeContactsPopupOpen: ref(false),
  isChangingContacts: ref(false),
  changeContactsError: ref<string | null>(null),
  changeContactsSuccess: ref<string | null>(null),
  contactForm: ref({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  }),
  canSubmitContactChange: ref(false),
  openChangeContactsPopup: vi.fn(),
  closeChangeContactsPopup: vi.fn(),
  confirmChangeContacts: vi.fn(),
}));

vi.stubGlobal("useBookingChangeDates", () => ({
  isChangeDatesPopupOpen: ref(false),
  isChangingDates: ref(false),
  changeDatesError: ref<string | null>(null),
  changeDatesSuccess: ref<string | null>(null),
  newDates: ref<[Date, Date] | null>(null),
  isChangeDatesCalendarOpen: ref(false),
  canSubmitDateChange: ref(false),
  openChangeDatesPopup: vi.fn(),
  closeChangeDatesPopup: vi.fn(),
  confirmChangeDates: vi.fn(),
}));

vi.stubGlobal("useBookingChangeRoom", () => ({
  isChangeRoomPopupOpen: ref(false),
  isChangingRoom: ref(false),
  changeRoomError: ref<string | null>(null),
  changeRoomSuccess: ref<string | null>(null),
  openChangeRoomPopup: vi.fn(),
  closeChangeRoomPopup: vi.fn(),
  confirmChangeRoom: vi.fn(),
}));

vi.stubGlobal("useBookingChangeServices", () => ({
  isChangeServicesPopupOpen: ref(false),
  isLoadingPackages: ref(false),
  isChangingServices: ref(false),
  changeServicesError: ref<string | null>(null),
  changeServicesSuccess: ref<string | null>(null),
  availablePackages: ref([]),
  selectedPackageCodes: ref<string[]>([]),
  openChangeServicesPopup: vi.fn(),
  closeChangeServicesPopup: vi.fn(),
  togglePackage: vi.fn(),
  confirmChangeServices: vi.fn(),
}));

// Мок QRCode — чтобы не падать при работе с canvas
const mockToCanvas = vi.fn().mockResolvedValue(undefined);
vi.mock("qrcode", () => ({
  default: {
    toCanvas: mockToCanvas,
  },
}));

// Мок useApi и useApiHelpers — чтобы composables не обращались к реальному fetch
// Используем stubGlobal поскольку composables вызывают их как авто-импорты (без явного import)
vi.stubGlobal("useApi", () => ({
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
}));

vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
}));

describe("pages/confirmation.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    // Сброс состояния
    createdBookingRef.value = null;
    loadingRef.value = false;
    isServerRequestRef.value = false;
    mockBookingStore.currentBookingUuid.value = null;
    mockBookingStore.guests = { rooms: 1, roomList: [] };
    mockBookingStore.error = null;
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.user = null;
    mockRoute.query = {};

    mockRouterPush.mockResolvedValue(undefined);
    mockToastAdd.mockReset();
    mockNotificationToastAdd.mockReset();
    mockBookingStore.getSessionBookingByUuid.mockReturnValue(null);
    mockBookingStore.getBookingByUuid.mockResolvedValue(undefined);
    mockIsBookingConfirmed.value = true;
    mockIsBookingFailed.value = false;
    mockIsAwaitingConfirmation.value = false;

    (globalThis as { fetch?: unknown }).fetch = undefined;
  });

  const createWrapper = () => mountComponent(ConfirmationPage);

  const defaultOrder: TestOrder = {
    name: "test",
    surname: "test",
    nationality: "Австрия",
    comment: null,
    payment_cancelled: "Условия отмены",
    start_at: "2026-03-26",
    end_at: "2026-03-27",
    nights: 1,
    pdf: "https://varvarka-api.grandfs-develop.ru/api/v1/booking/dbf0d341-a8ee-4156-ab97-8f195e532144/pdf",
  };

  const createBookingPayload = (
    overrides?: Partial<Omit<TestBooking, "order">> & {
      order?: Partial<TestOrder>;
    },
  ): TestBooking => {
    const { order, ...rest } = overrides ?? {};
    return {
      id: 179,
      number: "BW-2026-06-05-179",
      confirmation_number: null,
      status: "confirmed",
      order: { ...defaultOrder, ...order },
      rooms: [],
      total_price: 64000,
      payment: null,
      ...rest,
    };
  };

  describe("Рендеринг", () => {
    it("должен отображать номер бронирования и кнопки действий при наличии бронирования", async () => {
      createdBookingRef.value = createBookingPayload();

      const wrapper = createWrapper();
      await nextTick();

      const header = wrapper.find("h1");
      expect(header.exists()).toBe(true);
      expect(header.text()).toContain("Ваше бронирование подтверждено");

      const bookingNumber = wrapper.find("[class*='bookingNumber']");
      expect(bookingNumber.exists()).toBe(true);
      expect(bookingNumber.text()).toContain("№ BW-2026-06-05-179");

      const downloadButton = wrapper.find("button.btn__bs.danger");
      const printButton = wrapper.find("button.btn__bs.dark");
      expect(downloadButton.exists()).toBe(true);
      expect(downloadButton.text()).toBe("Скачать подтверждение");
      expect(printButton.exists()).toBe(true);
      expect(printButton.text()).toBe("Распечатать");
    });

    it("не должен показывать номер и кнопки скачать, если бронирование не создано", async () => {
      createdBookingRef.value = null;

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find("[class*='bookingNumber']").exists()).toBe(false);
      // Кнопка "Скачать подтверждение" скрыта без pdfUrl
      const downloadBtn = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Скачать подтверждение");
      expect(downloadBtn).toBeUndefined();
    });

    it("не должен показывать id если number отсутствует", async () => {
      createdBookingRef.value = createBookingPayload({
        number: "",
        id: 144,
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find("[class*='bookingNumber']").exists()).toBe(false);
    });

    it("должен показывать number из payload", async () => {
      createdBookingRef.value = createBookingPayload({
        number: "BW-2026-06-05-144",
        id: 144,
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find("[class*='bookingNumber']").text()).toContain(
        "BW-2026-06-05-144",
      );
    });

    it("должен отображать email подтверждения из order", async () => {
      createdBookingRef.value = createBookingPayload({
        order: { email: "guest@example.com" },
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).toContain("guest@example.com");
    });

    it("должен отображать email из authStore при отсутствии email в order", async () => {
      mockAuthStore.user = { email: "authuser@example.com" };
      createdBookingRef.value = createBookingPayload({
        order: { email: undefined },
      });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).toContain("authuser@example.com");
    });

    it("кнопка 'Отменить бронирование' видима когда allowed содержит cancel", async () => {
      createdBookingRef.value = createBookingPayload({ allowed: ["cancel"] });

      const wrapper = createWrapper();
      await nextTick();

      const cancelBtn = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Отменить бронирование");
      expect(cancelBtn).toBeDefined();
    });

    it("кнопка 'Отменить бронирование' скрыта когда allowed не содержит cancel", async () => {
      createdBookingRef.value = createBookingPayload({ allowed: [] });

      const wrapper = createWrapper();
      await nextTick();

      const cancelBtn = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Отменить бронирование");
      expect(cancelBtn).toBeUndefined();
    });

    it("кнопки управления видны только для разрешённых действий из allowed", async () => {
      createdBookingRef.value = createBookingPayload({
        allowed: ["edit-dates", "edit-contacts"],
      });

      const wrapper = createWrapper();
      await nextTick();
      const buttonLabels = wrapper.findAll("button").map((btn) => btn.text());

      expect(buttonLabels).toContain("Изменить даты");
      expect(buttonLabels).toContain("Изменить контакты");
      expect(buttonLabels).not.toContain("Изменить номер");
      expect(buttonLabels).not.toContain("Изменить услуги");
    });

    it("блок управления скрыт, если allowed не содержит edit-*", async () => {
      createdBookingRef.value = createBookingPayload({ allowed: ["cancel"] });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).not.toContain("Управление бронированием");
      expect(
        wrapper.findAll("button").find((btn) => btn.text() === "Изменить даты"),
      ).toBeUndefined();
    });

    it("кнопка 'Новое бронирование' всегда отображается", async () => {
      createdBookingRef.value = null;

      const wrapper = createWrapper();
      await nextTick();

      const newBookingBtn = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Новое бронирование");
      expect(newBookingBtn).toBeDefined();
    });
  });

  describe("Новое бронирование", () => {
    it("должен вызывать forceReset и переходить на / при нажатии 'Новое бронирование'", async () => {
      const wrapper = createWrapper();
      await nextTick();

      const newBookingBtn = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Новое бронирование");
      expect(newBookingBtn).toBeDefined();

      await newBookingBtn!.trigger("click");

      expect(mockBookingStore.forceReset).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  describe("Статус бронирования после оплаты", () => {
    it("должен показывать сообщение об ошибке при failed", async () => {
      mockIsBookingConfirmed.value = false;
      mockIsBookingFailed.value = true;

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).toContain("Не удалось забронировать");
      expect(wrapper.text()).toContain("попробуйте попытку позже");
      expect(wrapper.text()).not.toContain("Ваше бронирование подтверждено");
    });

    it("не должен показывать контент подтверждения во время processing", async () => {
      mockIsBookingConfirmed.value = false;
      mockIsBookingFailed.value = false;
      mockIsAwaitingConfirmation.value = true;
      createdBookingRef.value = createBookingPayload({ status: "processing" });

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).not.toContain("Ваше бронирование подтверждено");
      expect(wrapper.find("[class*='bookingNumber']").exists()).toBe(false);
    });
  });

  describe("Скачивание PDF", () => {
    it("должен вызывать fetch с pdfUrl при нажатии на кнопку 'Скачать подтверждение'", async () => {
      const booking = createBookingPayload();
      createdBookingRef.value = booking;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob()),
        statusText: "OK",
      });
      (globalThis as { fetch?: unknown }).fetch = fetchMock as unknown;

      const wrapper = createWrapper();
      await nextTick();

      const downloadButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Скачать подтверждение");
      expect(downloadButton).toBeDefined();
      await downloadButton!.trigger("click");

      expect(fetchMock).toHaveBeenCalledWith(
        booking.order.pdf,
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it("не должен вызывать fetch, если pdfUrl отсутствует", async () => {
      createdBookingRef.value = createBookingPayload({ order: { pdf: null } });

      const fetchMock = vi.fn();
      (globalThis as { fetch?: unknown }).fetch = fetchMock as unknown;

      const wrapper = createWrapper();
      await nextTick();

      // Кнопка скачивания не рендерится без pdfUrl
      const downloadButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Скачать подтверждение");
      expect(downloadButton).toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("должен открывать PDF напрямую при ошибке fetch", async () => {
      const booking = createBookingPayload();
      createdBookingRef.value = booking;

      const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
      (globalThis as { fetch?: unknown }).fetch = fetchMock as unknown;
      const openMock = vi.spyOn(window, "open").mockReturnValue(null);

      const wrapper = createWrapper();
      await nextTick();

      const downloadButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Скачать подтверждение");
      await downloadButton!.trigger("click");
      await nextTick();

      expect(openMock).toHaveBeenCalledWith(booking.order.pdf, "_blank");
    });
  });

  describe("Печать PDF", () => {
    it("должен открывать новое окно с pdfUrl и вызывать print при нажатии на 'Распечатать'", async () => {
      const booking = createBookingPayload();
      createdBookingRef.value = booking;

      const printMock = vi.fn();
      const openMock = vi
        .spyOn(window, "open")
        .mockReturnValue({ print: printMock } as unknown as Window);

      const wrapper = createWrapper();
      await nextTick();

      const printButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Распечатать");
      expect(printButton).toBeDefined();

      await printButton!.trigger("click");

      expect(openMock).toHaveBeenCalledWith(booking.order.pdf, "_blank");
      expect(printMock).toHaveBeenCalled();
    });

    it("не должен пытаться печатать, если pdfUrl отсутствует", async () => {
      createdBookingRef.value = createBookingPayload({ order: { pdf: null } });

      const openMock = vi.spyOn(window, "open").mockReturnValue(null);

      const wrapper = createWrapper();
      await nextTick();

      const printButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Распечатать");
      expect(printButton).toBeDefined();

      await printButton!.trigger("click");

      expect(openMock).not.toHaveBeenCalled();
    });

    it("должен показывать toast если окно печати заблокировано", async () => {
      createdBookingRef.value = createBookingPayload();

      vi.spyOn(window, "open").mockReturnValue(null);

      const wrapper = createWrapper();
      await nextTick();

      const printButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Распечатать");
      await printButton!.trigger("click");

      expect(mockNotificationToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "warn" }),
      );
    });
  });
});
