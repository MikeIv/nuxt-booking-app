import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBookingChangeContacts } from "~/composables/useBookingChangeContacts";
import { setupPinia } from "../utils/test-utils";

const mockPut = vi.fn();
vi.stubGlobal("useApi", () => ({ put: mockPut }));

const mockGetErrorMessage = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : String(e),
);
vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

const mockGetBookingByUuid = vi.fn();
const createdBookingRef = ref<unknown>(null);
vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    createdBooking: createdBookingRef,
    getBookingByUuid: mockGetBookingByUuid,
  }),
}));

const mockAuthUserRef = ref<{
  name?: string;
  surname?: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  country?: string;
} | null>(null);
vi.mock("~/stores/auth", () => ({
  useAuthStore: () => ({ user: mockAuthUserRef.value }),
}));

describe("useBookingChangeContacts", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    createdBookingRef.value = null;
    mockAuthUserRef.value = null;
    mockGetBookingByUuid.mockResolvedValue(undefined);
  });

  const makeComposable = (uuid: string | null = "booking-uuid") =>
    useBookingChangeContacts(computed(() => uuid));

  describe("buildContactFormFromBooking", () => {
    it("должен строить форму из данных order и guests бронирования", () => {
      createdBookingRef.value = {
        order: { name: "Иван", surname: "Иванов", nationality: "RU" },
        rooms: [
          {
            guests: [
              {
                is_main: true,
                name: "Иван",
                surname: "Иванов",
                middle_name: "Иванович",
                phone: "+79001234567",
                email: "ivan@example.com",
              },
            ],
          },
        ],
      };

      const { buildContactFormFromBooking } = makeComposable();
      const form = buildContactFormFromBooking();

      expect(form.name).toBe("Иван");
      expect(form.surname).toBe("Иванов");
      expect(form.middle_name).toBe("Иванович");
      expect(form.phone).toBe("+79001234567");
      expect(form.email).toBe("ivan@example.com");
      expect(form.country).toBe("RU");
    });

    it("должен использовать данные authStore при отсутствии данных бронирования", () => {
      createdBookingRef.value = null;
      mockAuthUserRef.value = {
        name: "Пётр",
        surname: "Петров",
        middle_name: "Петрович",
        phone: "+79009876543",
        email: "petr@example.com",
        country: "RU",
      };

      const { buildContactFormFromBooking } = makeComposable();
      const form = buildContactFormFromBooking();

      expect(form.name).toBe("Пётр");
      expect(form.surname).toBe("Петров");
      expect(form.email).toBe("petr@example.com");
    });

    it("должен выбирать первого гостя если главный не найден", () => {
      createdBookingRef.value = {
        order: { nationality: "" },
        rooms: [
          {
            guests: [
              {
                is_main: false,
                name: "Первый",
                email: "first@example.com",
                phone: "+79000000001",
              },
            ],
          },
        ],
      };

      const { buildContactFormFromBooking } = makeComposable();
      const form = buildContactFormFromBooking();

      expect(form.name).toBe("Первый");
      expect(form.email).toBe("first@example.com");
    });
  });

  describe("canSubmitContactChange", () => {
    it("должен быть false при пустой форме", () => {
      const { canSubmitContactChange } = makeComposable();
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при отсутствии обязательных полей", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при невалидном email", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "not-an-email",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при телефоне короче 10 символов", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "123",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть true при корректно заполненной форме", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(true);
    });

    it("должен быть false во время выполнения запроса", async () => {
      let resolvePost!: (v: unknown) => void;
      mockPut.mockReturnValue(
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
      );

      const { contactForm, canSubmitContactChange, confirmChangeContacts } =
        makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };

      const promise = confirmChangeContacts();
      expect(canSubmitContactChange.value).toBe(false);

      resolvePost({ success: true });
      await promise;
    });
  });

  describe("openChangeContactsPopup / closeChangeContactsPopup", () => {
    it("должен открывать попап и заполнять форму данными из бронирования", () => {
      createdBookingRef.value = {
        order: { name: "Тест", surname: "Тестов", nationality: "BY" },
        rooms: [],
      };

      const {
        isChangeContactsPopupOpen,
        contactForm,
        openChangeContactsPopup,
      } = makeComposable();
      openChangeContactsPopup();

      expect(isChangeContactsPopupOpen.value).toBe(true);
      expect(contactForm.value.name).toBe("Тест");
      expect(contactForm.value.country).toBe("BY");
    });

    it("должен сбрасывать состояние при открытии", () => {
      const {
        changeContactsError,
        changeContactsSuccess,
        openChangeContactsPopup,
      } = makeComposable();

      openChangeContactsPopup();

      expect(changeContactsError.value).toBeNull();
      expect(changeContactsSuccess.value).toBeNull();
    });

    it("должен закрывать попап и сбрасывать состояние", () => {
      const {
        isChangeContactsPopupOpen,
        changeContactsError,
        changeContactsSuccess,
        openChangeContactsPopup,
        closeChangeContactsPopup,
      } = makeComposable();

      openChangeContactsPopup();
      closeChangeContactsPopup();

      expect(isChangeContactsPopupOpen.value).toBe(false);
      expect(changeContactsError.value).toBeNull();
      expect(changeContactsSuccess.value).toBeNull();
    });
  });

  describe("confirmChangeContacts", () => {
    const validForm = {
      name: "Иван",
      surname: "Иванов",
      middle_name: "",
      phone: "+79001234567",
      email: "ivan@example.com",
      country: "RU",
    };

    it("должен устанавливать ошибку если UUID не задан", async () => {
      const { changeContactsError, confirmChangeContacts } =
        makeComposable(null);
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен устанавливать ошибку если форма невалидна", async () => {
      const { changeContactsError, confirmChangeContacts } = makeComposable();
      // Форма пустая по умолчанию
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен вызывать PUT /v1/users/profile с booking_change", async () => {
      mockPut.mockResolvedValue({ success: true });

      const { contactForm, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(mockPut).toHaveBeenCalledWith(
        "/v1/users/profile",
        expect.objectContaining({
          name: "Иван",
          email: "ivan@example.com",
          booking_change: expect.objectContaining({
            uuid: "booking-uuid",
            contacts: expect.objectContaining({
              email: "ivan@example.com",
              phone: "+79001234567",
            }),
          }),
        }),
        expect.any(Object),
      );
    });

    it("должен загружать обновлённое бронирование и устанавливать success при успехе", async () => {
      mockPut.mockResolvedValue({ success: true });

      const { contactForm, changeContactsSuccess, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(mockGetBookingByUuid).toHaveBeenCalledWith("booking-uuid");
      expect(changeContactsSuccess.value).toBeTruthy();
    });

    it("должен устанавливать ошибку при неуспешном ответе API", async () => {
      mockPut.mockResolvedValue({ success: false, message: "Ошибка сервера" });

      const {
        contactForm,
        changeContactsError,
        changeContactsSuccess,
        confirmChangeContacts,
      } = makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(changeContactsSuccess.value).toBeNull();
    });

    it("должен устанавливать ошибку при исключении", async () => {
      mockPut.mockRejectedValue(new Error("Сетевая ошибка"));
      mockGetErrorMessage.mockReturnValue("Сетевая ошибка");

      const { contactForm, changeContactsError, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(changeContactsError.value).toBe("Сетевая ошибка");
    });

    it("должен сбрасывать isChangingContacts после завершения", async () => {
      mockPut.mockResolvedValue({ success: true });

      const { contactForm, isChangingContacts, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(isChangingContacts.value).toBe(false);
    });
  });
});
