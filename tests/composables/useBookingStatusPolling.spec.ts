import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, nextTick, ref, defineComponent } from "vue";
import { useBookingStatusPolling } from "~/composables/useBookingStatusPolling";
import { setupPinia, mountComponent } from "../utils/test-utils";

const createdBookingRef = ref<{ status?: string } | null>(null);
const mockGetBookingByUuid = vi.fn();
const mockGetSessionBookingByUuid = vi.fn();
const mockSetBookingByUuid = vi.fn();
const mockSetLoading = vi.fn();
const mockSetServerRequest = vi.fn();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    createdBooking: createdBookingRef,
    getBookingByUuid: mockGetBookingByUuid,
    getSessionBookingByUuid: mockGetSessionBookingByUuid,
    setBookingByUuid: mockSetBookingByUuid,
    setLoading: mockSetLoading,
    setServerRequest: mockSetServerRequest,
    error: null,
  }),
}));

const TestHost = defineComponent({
  setup() {
    const bookingUuid = ref<string | null>("test-uuid");
    const polling = useBookingStatusPolling(
      computed(() => bookingUuid.value),
      {
        onLoadError: vi.fn(),
        onConfirmed: vi.fn(),
      },
    );
    return { ...polling, bookingUuid };
  },
  template: "<div />",
});

describe("useBookingStatusPolling", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    vi.useFakeTimers();

    createdBookingRef.value = null;
    mockGetSessionBookingByUuid.mockReturnValue(null);
    mockGetBookingByUuid.mockResolvedValue({ status: "confirmed" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountPolling = () => mountComponent(TestHost);

  it("должен опрашивать API каждые 5 секунд пока status = processing", async () => {
    mockGetBookingByUuid
      .mockResolvedValueOnce({ status: "processing" })
      .mockResolvedValueOnce({ status: "processing" })
      .mockResolvedValueOnce({ status: "confirmed" });

    const wrapper = mountPolling();
    await nextTick();
    await nextTick();

    expect(mockGetBookingByUuid).toHaveBeenCalledWith("test-uuid", {
      silent: true,
    });
    expect(mockSetLoading).toHaveBeenCalledWith(
      true,
      "Ожидаем подтверждение бронирования...",
    );
    expect(wrapper.vm.isAwaitingConfirmation).toBe(true);

    await vi.advanceTimersByTimeAsync(5000);
    await nextTick();
    await vi.advanceTimersByTimeAsync(5000);
    await nextTick();

    expect(mockGetBookingByUuid.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(wrapper.vm.isBookingConfirmed).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it("должен переключаться в failed и останавливать polling", async () => {
    mockGetBookingByUuid.mockResolvedValue({ status: "failed" });

    const wrapper = mountPolling();
    await nextTick();
    await vi.runOnlyPendingTimersAsync();
    await nextTick();

    expect(wrapper.vm.isBookingFailed).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);

    await vi.advanceTimersByTimeAsync(10000);
    expect(mockGetBookingByUuid).toHaveBeenCalledTimes(1);
  });

  it("должен использовать кэш без запроса если status не processing", async () => {
    const cachedBooking = { status: "confirmed", id: 1 };
    mockGetSessionBookingByUuid.mockReturnValue(cachedBooking);

    const wrapper = mountPolling();
    await nextTick();
    await vi.runOnlyPendingTimersAsync();
    await nextTick();

    expect(mockSetBookingByUuid).toHaveBeenCalledWith(cachedBooking);
    expect(mockGetBookingByUuid).not.toHaveBeenCalled();
    expect(wrapper.vm.isBookingConfirmed).toBe(true);
  });

  it("должен опрашивать API если в кэше status = processing", async () => {
    const cachedBooking = { status: "processing", id: 1 };
    mockGetSessionBookingByUuid.mockReturnValue(cachedBooking);
    mockGetBookingByUuid.mockResolvedValue({ status: "confirmed" });

    const wrapper = mountPolling();
    await nextTick();
    await nextTick();

    expect(mockSetBookingByUuid).toHaveBeenCalledWith(cachedBooking);
    expect(mockGetBookingByUuid).toHaveBeenCalledWith("test-uuid", {
      silent: true,
    });
    expect(wrapper.vm.isBookingConfirmed).toBe(true);
  });

  it("должен продолжать polling после сетевой ошибки, не показывая failed", async () => {
    mockGetBookingByUuid
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ status: "confirmed" });

    const onLoadError = vi.fn();
    const TestHostWithError = defineComponent({
      setup() {
        const bookingUuid = ref<string | null>("test-uuid");
        return useBookingStatusPolling(
          computed(() => bookingUuid.value),
          {
            onLoadError,
          },
        );
      },
      template: "<div />",
    });

    const wrapper = mountComponent(TestHostWithError);
    await nextTick();
    await nextTick();

    expect(onLoadError).toHaveBeenCalled();
    expect(wrapper.vm.isBookingFailed).toBe(false);
    expect(wrapper.vm.isAwaitingConfirmation).toBe(true);

    await vi.advanceTimersByTimeAsync(5000);
    await nextTick();

    expect(wrapper.vm.isBookingConfirmed).toBe(true);
  });
});
