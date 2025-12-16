import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import { useUserProfile } from "~/composables/useUserProfile";
import { setupPinia } from "../utils/test-utils";
import { createMockAuthStore, resetMockAuthStore } from "../mocks/stores";

// Мокируем API
const mockPut = vi.fn();
const mockGet = vi.fn();
vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    put: mockPut,
    get: mockGet,
  }),
}));

// Мокируем toast
const mockToastAdd = vi.fn();
vi.mock("~/composables/useToast", () => ({
  useNotificationToast: () => ({
    add: mockToastAdd,
  }),
}));

// Мокируем auth store
const mockAuthStore = createMockAuthStore();

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

// Мокируем booking store
const mockBookingStoreSaveUserProfile = vi.fn();
vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    saveUserProfile: mockBookingStoreSaveUserProfile,
  }),
}));

describe("useUserProfile", () => {
  beforeEach(() => {
    // Устанавливаем начальное состояние пользователя до создания Pinia
    mockAuthStore.user = {
      id: 123,
      name: "Иван",
      surname: "Иванов",
      middle_name: "Иванович",
      phone: "+7 (999) 123-45-67",
      email: "ivan@example.com",
      country: "Россия",
    };

    setupPinia();
    vi.clearAllMocks();
    resetMockAuthStore(mockAuthStore);
  });

  describe("saveChanges", () => {
    it("должен успешно сохранять данные профиля и обновлять formData", async () => {
      // Настраиваем моки
      mockPut.mockResolvedValue({
        success: true,
        payload: {
          id: 123,
          name: "Иван",
          surname: "Иванов",
          middle_name: "Иванович",
          phone: "+7 (999) 123-45-67",
          email: "ivan@example.com",
          country: "Россия",
        },
        message: "Профиль обновлен",
      });

      mockToastAdd.mockClear();
      mockBookingStoreSaveUserProfile.mockClear();

      const { formData, saveChanges, hasChanges, isSaving } = useUserProfile();

      // Ждем, пока watcher обновит formData
      await nextTick();

      // Проверяем начальное состояние
      expect(formData.name).toBe("Иван");
      expect(formData.surname).toBe("Иванов");

      // Изменяем данные формы
      formData.name = "Петр";
      formData.surname = "Петров";

      // Проверяем, что есть изменения (hasChanges обновляется реактивно)
      expect(hasChanges.value).toBe(true);

      // Сохраняем изменения
      await saveChanges();

      // Проверяем, что API был вызван
      expect(mockPut).toHaveBeenCalledTimes(1);

      // Ждем обновления reactive данных
      await nextTick();

      // Проверяем, что formData обновлен данными с сервера
      expect(formData.name).toBe("Иван");
      expect(formData.surname).toBe("Иванов");
      expect(hasChanges.value).toBe(false);
      expect(isSaving.value).toBe(false);

      // Проверяем, что toast был показан
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "success",
        summary: "Успешно",
        detail: "Профиль обновлен",
        life: 3000,
      });
    });

    it("должен обрабатывать ошибки сохранения", async () => {
      // Настраиваем моки
      mockPut.mockResolvedValue({
        success: false,
        message: "Ошибка сохранения",
      });

      mockToastAdd.mockClear();

      mockAuthStore.user = {
        id: 123,
        name: "Иван",
        surname: "Иванов",
        email: "ivan@example.com",
      };

      const { saveChanges, isSaving } = useUserProfile();

      await saveChanges();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "Ошибка",
        detail: "Ошибка сохранения",
        life: 5000,
      });

      expect(isSaving.value).toBe(false);
    });
  });
});
