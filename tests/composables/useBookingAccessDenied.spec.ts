import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBookingAccessDenied } from "~/composables/useBookingAccessDenied";
import { BOOKING_ACCESS_DENIED_MESSAGE } from "~/composables/useApiHelpers";
import { mockRouterPush } from "../mocks/nuxt";

const mockToastAdd = vi.fn();
vi.stubGlobal("useNotificationToast", () => ({ add: mockToastAdd }));

describe("useBookingAccessDenied", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
  });

  it("должен показывать toast и перенаправлять на главную", async () => {
    const { handleBookingAccessDenied } = useBookingAccessDenied();

    await handleBookingAccessDenied();

    expect(mockToastAdd).toHaveBeenCalledWith({
      severity: "error",
      summary: "Ошибка",
      detail: BOOKING_ACCESS_DENIED_MESSAGE,
      life: 5000,
    });
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });

  it("должен обрабатывать только 403", async () => {
    const { handleBookingAccessDeniedIfNeeded } = useBookingAccessDenied();

    const handled = await handleBookingAccessDeniedIfNeeded({
      message: "Forbidden",
      status: 403,
    });

    expect(handled).toBe(true);
    expect(mockToastAdd).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });

  it("не должен обрабатывать другие статусы", async () => {
    const { handleBookingAccessDeniedIfNeeded } = useBookingAccessDenied();

    const handled = await handleBookingAccessDeniedIfNeeded({
      message: "Not found",
      status: 404,
    });

    expect(handled).toBe(false);
    expect(mockToastAdd).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
