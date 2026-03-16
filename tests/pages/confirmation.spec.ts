import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
import ConfirmationPage from "~/pages/confirmation.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import { mockRouterPush, mockToastAdd } from "../mocks/nuxt";

// Моки для booking и auth store
type TestOrder = {
  name: string;
  surname: string;
  nationality: string;
  comment: string | null;
  payment_cancelled: string | null;
  start_at: string;
  end_at: string;
  nights: number;
  pdf: string | null;
};

type TestBooking = {
  id: number;
  confirmation_number: string | null;
  status: string;
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
  error: null as string | null,
  guests: {
    rooms: 1,
    roomList: [],
  },
  setLoading: vi.fn(),
  getBookingByUuid: vi.fn(),
  forceReset: vi.fn(),
  getSelectedServicesForRoom: vi.fn().mockReturnValue([]),
  formatDate: vi.fn(),
};

const mockAuthStore = {
  isAuthenticated: false,
};

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

// Мок тоста
const mockNotificationToastAdd = vi.fn();

vi.mock("~/composables/useToast", () => ({
  useNotificationToast: () => ({
    add: mockNotificationToastAdd,
  }),
}));

// Мок QRCode, чтобы не падать при работе с canvas
const mockToCanvas = vi.fn().mockResolvedValue(undefined);

vi.mock("qrcode", () => ({
  default: {
    toCanvas: mockToCanvas,
  },
}));

describe("pages/confirmation.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    // Сбрасываем состояние стора
    createdBookingRef.value = null;
    loadingRef.value = false;
    isServerRequestRef.value = false;
    mockBookingStore.guests = {
      rooms: 1,
      roomList: [],
    };

    mockRouterPush.mockResolvedValue(undefined);
    mockToastAdd.mockReset();
    mockNotificationToastAdd.mockReset();

    // Сбрасываем глобальные моки window/fetch
    (globalThis as { fetch?: unknown }).fetch = undefined;
  });

  const createWrapper = () => mountComponent(ConfirmationPage);

  const createBookingPayload = (overrides?: Partial<TestBooking>) => ({
    id: 179,
    confirmation_number: null,
    status: "confirmed",
    order: {
      name: "test",
      surname: "test",
      nationality: "Австрия",
      comment: null,
      payment_cancelled: "Условия отмены",
      start_at: "2026-03-26",
      end_at: "2026-03-27",
      nights: 1,
      pdf: "https://varvarka-api.grandfs-develop.ru/api/v1/booking/dbf0d341-a8ee-4156-ab97-8f195e532144/pdf",
    },
    rooms: [],
    total_price: 64000,
    payment: null,
    ...overrides,
  });

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
      expect(bookingNumber.text()).toContain("№ 179");

      const downloadButton = wrapper.find("button.btn__bs.danger");
      const printButton = wrapper.find("button.btn__bs.dark");
      expect(downloadButton.exists()).toBe(true);
      expect(downloadButton.text()).toBe("Скачать подтверждение");
      expect(printButton.exists()).toBe(true);
      expect(printButton.text()).toBe("Распечатать");
    });

    it("не должен показывать номер и кнопки, если бронирование не создано", async () => {
      createdBookingRef.value = null;

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find("[class*='bookingNumber']").exists()).toBe(false);
      expect(wrapper.find("button.btn__bs.danger").exists()).toBe(false);
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

      expect(fetchMock).toHaveBeenCalledWith(booking.order.pdf);
    });

    it("не должен вызывать fetch, если pdfUrl отсутствует", async () => {
      createdBookingRef.value = createBookingPayload({
        order: {
          pdf: null,
        },
      });

      const fetchMock = vi.fn();
      (globalThis as { fetch?: unknown }).fetch = fetchMock as unknown;

      const wrapper = createWrapper();
      await nextTick();

      const downloadButton = wrapper
        .findAll("button")
        .find((btn) => btn.text() === "Скачать подтверждение");

      // Кнопка не должна отрисовываться без pdfUrl
      expect(downloadButton).toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
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
      createdBookingRef.value = createBookingPayload({
        order: {
          pdf: null,
        },
      });

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
  });
});
