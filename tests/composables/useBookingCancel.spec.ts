import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed } from "vue";
import { useBookingCancel } from "~/composables/useBookingCancel";
import { setupPinia } from "../utils/test-utils";
import { mockRouterPush } from "../mocks/nuxt";

const mockPost = vi.fn();
vi.stubGlobal("useApi", () => ({ post: mockPost }));

const mockGetErrorMessage = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : String(e),
);
vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

const mockForceReset = vi.fn();
vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({ forceReset: mockForceReset }),
}));

const mockToastAdd = vi.fn();
vi.stubGlobal("useNotificationToast", () => ({ add: mockToastAdd }));

describe("useBookingCancel", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
  });

  const makeComposable = (uuid: string | null) =>
    useBookingCancel(computed(() => uuid));

  describe("openCancelBookingPopup", () => {
    it("должен открывать попап и сбрасывать ошибку", () => {
      const {
        isCancelBookingPopupOpen,
        cancelBookingError,
        openCancelBookingPopup,
      } = makeComposable("test-uuid");

      openCancelBookingPopup();

      expect(isCancelBookingPopupOpen.value).toBe(true);
      expect(cancelBookingError.value).toBeNull();
    });
  });

  describe("closeCancelBookingPopup", () => {
    it("должен закрывать попап и сбрасывать ошибку", () => {
      const {
        isCancelBookingPopupOpen,
        cancelBookingError,
        openCancelBookingPopup,
        closeCancelBookingPopup,
      } = makeComposable("test-uuid");

      openCancelBookingPopup();
      closeCancelBookingPopup();

      expect(isCancelBookingPopupOpen.value).toBe(false);
      expect(cancelBookingError.value).toBeNull();
    });

    it("должен сбрасывать ошибку при закрытии", () => {
      const {
        cancelBookingError,
        openCancelBookingPopup,
        closeCancelBookingPopup,
        confirmCancelBooking,
      } = makeComposable(null);

      openCancelBookingPopup();
      // confirmCancelBooking без uuid установит toast, но не error
      void confirmCancelBooking();
      closeCancelBookingPopup();

      expect(cancelBookingError.value).toBeNull();
    });
  });

  describe("confirmCancelBooking", () => {
    it("должен показывать toast и закрывать попап если UUID не задан", async () => {
      const {
        confirmCancelBooking,
        isCancelBookingPopupOpen,
        openCancelBookingPopup,
      } = makeComposable(null);

      openCancelBookingPopup();
      await confirmCancelBooking();

      expect(mockPost).not.toHaveBeenCalled();
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" }),
      );
      expect(isCancelBookingPopupOpen.value).toBe(false);
    });

    it("должен вызывать POST, сбрасывать стор и переходить на / при успехе", async () => {
      mockPost.mockResolvedValue({ success: true });

      const { confirmCancelBooking } = makeComposable("booking-uuid-123");
      await confirmCancelBooking();

      expect(mockPost).toHaveBeenCalledWith(
        "/v1/booking/booking-uuid-123/cancel",
        { uuid: "booking-uuid-123" },
        expect.any(Object),
      );
      expect(mockForceReset).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });

    it("должен закрывать попап и сбрасывать ошибку при успехе", async () => {
      mockPost.mockResolvedValue({ success: true });

      const {
        isCancelBookingPopupOpen,
        cancelBookingError,
        confirmCancelBooking,
        openCancelBookingPopup,
      } = makeComposable("booking-uuid-123");

      openCancelBookingPopup();
      await confirmCancelBooking();

      expect(isCancelBookingPopupOpen.value).toBe(false);
      expect(cancelBookingError.value).toBeNull();
    });

    it("должен устанавливать cancelBookingError при неуспешном ответе API", async () => {
      mockPost.mockResolvedValue({
        success: false,
        message: "Бронирование нельзя отменить",
      });

      const { confirmCancelBooking, cancelBookingError } =
        makeComposable("booking-uuid-123");
      await confirmCancelBooking();

      expect(cancelBookingError.value).toBe("Бронирование нельзя отменить");
      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(mockForceReset).not.toHaveBeenCalled();
    });

    it("должен устанавливать cancelBookingError и показывать toast при сетевой ошибке", async () => {
      mockPost.mockRejectedValue(new Error("Сетевая ошибка"));
      mockGetErrorMessage.mockReturnValue("Сетевая ошибка");

      const { confirmCancelBooking, cancelBookingError } =
        makeComposable("booking-uuid-123");
      await confirmCancelBooking();

      expect(cancelBookingError.value).toBe("Сетевая ошибка");
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          detail: "Сетевая ошибка",
        }),
      );
    });

    it("должен сбрасывать isCancellingBooking после успешного завершения", async () => {
      mockPost.mockResolvedValue({ success: true });

      const { confirmCancelBooking, isCancellingBooking } =
        makeComposable("booking-uuid-123");
      await confirmCancelBooking();

      expect(isCancellingBooking.value).toBe(false);
    });

    it("должен сбрасывать isCancellingBooking при ошибке", async () => {
      mockPost.mockRejectedValue(new Error("Ошибка"));

      const { confirmCancelBooking, isCancellingBooking } =
        makeComposable("booking-uuid-123");
      await confirmCancelBooking();

      expect(isCancellingBooking.value).toBe(false);
    });

    it("не должен выполнять повторный запрос если отмена уже в процессе", async () => {
      let resolvePost!: (v: unknown) => void;
      mockPost.mockReturnValue(
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
      );

      const { confirmCancelBooking } = makeComposable("booking-uuid-123");

      const p1 = confirmCancelBooking();
      const p2 = confirmCancelBooking(); // вызов пока первый ещё выполняется

      resolvePost({ success: true });
      await p1;
      await p2;

      expect(mockPost).toHaveBeenCalledTimes(1);
    });
  });
});
