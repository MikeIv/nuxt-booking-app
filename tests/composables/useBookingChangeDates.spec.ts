import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBookingChangeDates } from "~/composables/useBookingChangeDates";
import { setupPinia } from "../utils/test-utils";

const mockPut = vi.fn();
vi.stubGlobal("useApi", () => ({ put: mockPut }));

const mockGetErrorMessage = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : String(e),
);
vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

// Состояние store
const dateRef = ref<[Date, Date] | null>(null);
const selectedRoomTypeRef = ref<string | null>(null);
const selectedTariffRef = ref<{
  rate_plan_code: string;
  title: string;
  price: number;
} | null>(null);
const createdBookingRef = ref<unknown>(null);

const mockSearch = vi.fn();
const mockSearchPackages = vi.fn();
const mockGetBookingByUuid = vi.fn();
const mockFormatDate = vi.fn((d: Date) => d.toISOString().split("T")[0]);
const mockSetGuests = vi.fn();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    date: dateRef,
    selectedRoomType: selectedRoomTypeRef,
    selectedTariff: selectedTariffRef,
    createdBooking: createdBookingRef,
    search: mockSearch,
    searchPackages: mockSearchPackages,
    getBookingByUuid: mockGetBookingByUuid,
    formatDate: mockFormatDate,
    setGuests: mockSetGuests,
    setSelectedTariff: (value: typeof selectedTariffRef.value) => {
      selectedTariffRef.value = value;
    },
    setDate: (value: [Date, Date] | null) => {
      dateRef.value = value;
    },
  }),
}));

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => ({ user: null }),
}));

describe("useBookingChangeDates", () => {
  const startDate = new Date("2026-04-10");
  const endDate = new Date("2026-04-12");
  const newStart = new Date("2026-04-15");
  const newEnd = new Date("2026-04-17");

  const availableSearchResult = {
    available: true,
    rooms: [
      {
        room_type_code: "STANDARD",
        tariffs: [{ rate_plan_code: "BBREAKFAST", title: "BB", price: 5000 }],
      },
    ],
  };

  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    dateRef.value = [startDate, endDate];
    selectedRoomTypeRef.value = "STANDARD";
    selectedTariffRef.value = {
      rate_plan_code: "BBREAKFAST",
      title: "BB",
      price: 5000,
    };
    createdBookingRef.value = null;

    mockSearch.mockResolvedValue(availableSearchResult);
    mockSearchPackages.mockResolvedValue([]);
    mockGetBookingByUuid.mockResolvedValue(undefined);
    mockPut.mockResolvedValue({ success: true });
  });

  const makeComposable = (uuid: string | null = "booking-uuid") => {
    const uuidRef = computed(() => uuid);
    const bookingDateRef = computed(() => dateRef.value);
    return useBookingChangeDates(uuidRef, bookingDateRef);
  };

  describe("canSubmitDateChange", () => {
    it("должен быть false когда newDates не задан", () => {
      const { canSubmitDateChange } = makeComposable();
      expect(canSubmitDateChange.value).toBe(false);
    });

    it("должен быть false когда даты совпадают", () => {
      const { newDates, canSubmitDateChange } = makeComposable();
      newDates.value = [startDate, startDate];
      expect(canSubmitDateChange.value).toBe(false);
    });

    it("должен быть false когда конечная дата раньше начальной", () => {
      const { newDates, canSubmitDateChange } = makeComposable();
      newDates.value = [endDate, startDate];
      expect(canSubmitDateChange.value).toBe(false);
    });

    it("должен быть true когда даты корректны", () => {
      const { newDates, canSubmitDateChange } = makeComposable();
      newDates.value = [newStart, newEnd];
      expect(canSubmitDateChange.value).toBe(true);
    });

    it("должен быть false во время выполнения запроса", async () => {
      let resolveSearch!: (v: unknown) => void;
      mockSearch.mockReturnValue(
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
      );

      const { newDates, canSubmitDateChange, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];

      const promise = confirmChangeDates();
      expect(canSubmitDateChange.value).toBe(false);

      resolveSearch(availableSearchResult);
      await promise;
    });
  });

  describe("openChangeDatesPopup / closeChangeDatesPopup", () => {
    it("должен открывать попап и копировать текущие даты из bookingDate", () => {
      const { isChangeDatesPopupOpen, newDates, openChangeDatesPopup } =
        makeComposable();
      openChangeDatesPopup();

      expect(isChangeDatesPopupOpen.value).toBe(true);
      expect(newDates.value).not.toBeNull();
      expect(newDates.value![0]).toEqual(startDate);
      expect(newDates.value![1]).toEqual(endDate);
    });

    it("должен устанавливать newDates=null если bookingDate не задан", () => {
      dateRef.value = null;
      const { newDates, openChangeDatesPopup } = makeComposable();
      openChangeDatesPopup();

      expect(newDates.value).toBeNull();
    });

    it("должен сбрасывать состояние при открытии", () => {
      const { changeDatesError, changeDatesSuccess, openChangeDatesPopup } =
        makeComposable();
      openChangeDatesPopup();

      expect(changeDatesError.value).toBeNull();
      expect(changeDatesSuccess.value).toBeNull();
    });

    it("должен закрывать попап и сбрасывать состояние", () => {
      const {
        isChangeDatesPopupOpen,
        openChangeDatesPopup,
        closeChangeDatesPopup,
      } = makeComposable();
      openChangeDatesPopup();
      closeChangeDatesPopup();

      expect(isChangeDatesPopupOpen.value).toBe(false);
    });
  });

  describe("confirmChangeDates", () => {
    it("должен устанавливать ошибку если UUID не задан", async () => {
      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable(null);
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it("должен устанавливать ошибку если roomTypeCode не определён", async () => {
      selectedRoomTypeRef.value = null;
      createdBookingRef.value = null;

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it("должен устанавливать ошибку если ratePlanCode не определён", async () => {
      selectedTariffRef.value = null;
      createdBookingRef.value = null;

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(mockSearch).not.toHaveBeenCalled();
    });

    it("не должен делать запрос если canSubmitDateChange=false", async () => {
      const { changeDatesError, confirmChangeDates } = makeComposable();
      // newDates не задан → canSubmitDateChange = false
      await confirmChangeDates();

      expect(mockSearch).not.toHaveBeenCalled();
      expect(changeDatesError.value).toBeNull();
    });

    it("должен откатывать дату и устанавливать ошибку если номер недоступен", async () => {
      mockSearch.mockResolvedValue({ available: false, rooms: [] });

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(dateRef.value).toEqual([startDate, endDate]); // восстановлено
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен откатывать дату если выбранный тариф недоступен на новые даты", async () => {
      mockSearch.mockResolvedValue({
        available: true,
        rooms: [
          {
            room_type_code: "STANDARD",
            tariffs: [
              { rate_plan_code: "OTHER_TARIFF", title: "Other", price: 3000 },
            ],
          },
        ],
      });

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(dateRef.value).toEqual([startDate, endDate]); // восстановлено
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен устанавливать ошибку если пакеты недоступны на новые даты", async () => {
      createdBookingRef.value = {
        rooms: [
          {
            id: 1,
            room_type_code: "STANDARD",
            rate_plan_code: "BBREAKFAST",
            packages: ["SPA"],
            adults: 1,
            children: 0,
            guests: [],
          },
        ],
      };
      mockSearchPackages.mockResolvedValue([]);

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(dateRef.value).toEqual([startDate, endDate]);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен успешно изменять даты, вызывать PUT и загружать бронирование", async () => {
      createdBookingRef.value = {
        rooms: [
          {
            id: 1,
            room_type_code: "STANDARD",
            rate_plan_code: "BBREAKFAST",
            packages: [],
            adults: 1,
            children: 0,
            guests: [],
          },
        ],
      };

      const { newDates, changeDatesSuccess, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(mockPut).toHaveBeenCalledWith(
        "/v1/booking/booking-uuid",
        expect.objectContaining({
          start_at: "2026-04-15",
          end_at: "2026-04-17",
          rooms: expect.arrayContaining([
            expect.objectContaining({
              booking_id: 1,
              room_type_code: "STANDARD",
              rate_plan_code: "BBREAKFAST",
            }),
          ]),
        }),
        expect.any(Object),
      );
      expect(mockGetBookingByUuid).toHaveBeenCalledWith("booking-uuid");
      expect(changeDatesSuccess.value).toBeTruthy();
    });

    it("должен откатывать дату и тариф при неуспешном ответе API", async () => {
      mockPut.mockResolvedValue({ success: false, message: "Ошибка сервера" });
      mockGetErrorMessage.mockReturnValue("Ошибка сервера");

      const prevTariff = selectedTariffRef.value;
      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBeTruthy();
      expect(dateRef.value).toEqual([startDate, endDate]);
      expect(selectedTariffRef.value).toEqual(prevTariff);
    });

    it("должен откатывать дату и тариф при исключении", async () => {
      mockPut.mockRejectedValue(new Error("Сетевая ошибка"));
      mockGetErrorMessage.mockReturnValue("Сетевая ошибка");

      const { newDates, changeDatesError, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(changeDatesError.value).toBe("Сетевая ошибка");
      expect(dateRef.value).toEqual([startDate, endDate]);
    });

    it("должен сбрасывать isChangingDates после завершения (успех)", async () => {
      const { newDates, isChangingDates, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(isChangingDates.value).toBe(false);
    });

    it("должен сбрасывать isChangingDates после завершения (ошибка)", async () => {
      mockSearch.mockResolvedValue({ available: false, rooms: [] });

      const { newDates, isChangingDates, confirmChangeDates } =
        makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(isChangingDates.value).toBe(false);
    });

    it("должен передавать rate_plan_code, а не rate_type_code, в PUT", async () => {
      createdBookingRef.value = {
        rooms: [
          {
            id: 1,
            room_type_code: "STANDARD",
            rate_plan_code: "BBREAKFAST",
            rate_type_code: "WRONG-CODE",
            packages: [],
            adults: 1,
            children: 0,
            guests: [],
          },
        ],
      };

      const { newDates, confirmChangeDates } = makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(mockPut).toHaveBeenCalledWith(
        "/v1/booking/booking-uuid",
        expect.objectContaining({
          rooms: [
            expect.objectContaining({
              rate_plan_code: "BBREAKFAST",
            }),
          ],
        }),
        expect.any(Object),
      );
    });

    it("должен передавать форматированные даты в теле PUT", async () => {
      createdBookingRef.value = {
        rooms: [
          {
            id: 1,
            room_type_code: "STANDARD",
            rate_plan_code: "BBREAKFAST",
            packages: [],
            adults: 1,
            children: 0,
            guests: [],
          },
        ],
      };
      mockFormatDate
        .mockReturnValueOnce("2026-04-15")
        .mockReturnValueOnce("2026-04-17");

      const { newDates, confirmChangeDates } = makeComposable();
      newDates.value = [newStart, newEnd];
      await confirmChangeDates();

      expect(mockPut).toHaveBeenCalledWith(
        "/v1/booking/booking-uuid",
        expect.objectContaining({
          start_at: "2026-04-15",
          end_at: "2026-04-17",
        }),
        expect.any(Object),
      );
    });
  });
});
