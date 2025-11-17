/**
 * Моки для компонентов
 */
import { vi } from "vitest";

/**
 * Настраивает моки для общих компонентов
 */
export function setupComponentMocks() {
  // Мок для RequestErrorMessage
  vi.mock("~/components/common/RequestErrorMessage.vue", () => ({
    getRequestErrorContent: (status?: number, message?: string | null) => ({
      summary: status ? `Ошибка ${status}` : "Ошибка",
      detail: message || "Произошла ошибка",
    }),
  }));
}
