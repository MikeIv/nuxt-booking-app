import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import CancellationPage from "~/pages/cancellation.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import { mockRouterPush, mockRoute } from "../mocks/nuxt";

const mockBookingStore = {
  forceReset: vi.fn(),
};

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

describe("pages/cancellation.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    mockRoute.query = {};
    mockRouterPush.mockResolvedValue(undefined);
  });

  const createWrapper = () => mountComponent(CancellationPage);

  describe("Рендеринг", () => {
    it("должен отображать заголовок отмены бронирования", async () => {
      const wrapper = createWrapper();
      await nextTick();

      const header = wrapper.find("h1");
      expect(header.exists()).toBe(true);
      expect(header.text()).toContain("Ваше бронирование успешно отменено!");
    });

    it("должен отображать номер бронирования из query", async () => {
      mockRoute.query = { bookingNumber: "A-12345" };

      const wrapper = createWrapper();
      await nextTick();

      const bookingNumber = wrapper.find("[class*='bookingNumber']");
      expect(bookingNumber.exists()).toBe(true);
      expect(bookingNumber.text()).toContain("№ A-12345");
    });

    it("не должен отображать номер бронирования при пустом bookingNumber", async () => {
      mockRoute.query = { bookingNumber: "   " };

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find("[class*='bookingNumber']").exists()).toBe(false);
    });

    it("должен отображать email из query", async () => {
      mockRoute.query = { email: "guest@example.com" };

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).toContain("guest@example.com");
    });

    it("не должен отображать email при пустом значении в query", async () => {
      mockRoute.query = { email: "   " };

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.text()).not.toContain("<strong>");
      expect(wrapper.text()).not.toContain("guest@example.com");
    });
  });

  describe("Новое бронирование", () => {
    it("должен вызывать forceReset и переходить на / при нажатии кнопки", async () => {
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
});
