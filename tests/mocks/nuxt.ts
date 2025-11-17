/**
 * Моки для Nuxt composables
 */
import { vi } from "vitest";

export const mockRouterPush = vi.fn().mockResolvedValue(undefined);
export const mockRoute = { path: "/" };
export const mockToastAdd = vi.fn();

// Настраиваем моки для Nuxt composables глобально
vi.mock("#app", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useRoute: () => mockRoute,
  useToast: () => ({
    add: mockToastAdd,
  }),
  definePageMeta: vi.fn(),
}));

// Мокируем глобальные auto-imports Nuxt
vi.mock("nuxt/app", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useRoute: () => mockRoute,
  useToast: () => ({
    add: mockToastAdd,
  }),
  definePageMeta: vi.fn(),
}));

// Глобальные моки для window/global
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).useRouter = () => ({
    push: mockRouterPush,
  });
  (globalThis as Record<string, unknown>).useRoute = () => mockRoute;
  (globalThis as Record<string, unknown>).useToast = () => ({
    add: mockToastAdd,
  });
  (globalThis as Record<string, unknown>).definePageMeta = vi.fn();
}
