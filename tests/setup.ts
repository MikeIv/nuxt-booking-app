/**
 * Глобальная настройка для всех тестов
 * Этот файл выполняется перед каждым тестом
 */
import { beforeEach, vi } from "vitest";
import { storeToRefs } from "pinia";
import { mockRouterPush, mockRoute, mockToastAdd } from "./mocks/nuxt";
import { setupComponentMocks } from "./mocks/components";

// Настраиваем моки компонентов один раз для всех тестов
setupComponentMocks();

// Настраиваем глобальные моки для Nuxt auto-imports
vi.stubGlobal("useRouter", () => ({
  push: mockRouterPush,
}));

vi.stubGlobal("useRoute", () => mockRoute);

vi.stubGlobal("useToast", () => ({
  add: mockToastAdd,
}));

// storeToRefs из Pinia должен быть доступен глобально
vi.stubGlobal("storeToRefs", storeToRefs);

// Сбрасываем моки перед каждым тестом
beforeEach(() => {
  vi.clearAllMocks();
  mockRouterPush.mockResolvedValue(undefined);
  mockRoute.path = "/";
});
