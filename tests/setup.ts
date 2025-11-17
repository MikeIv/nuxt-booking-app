/**
 * Глобальная настройка для всех тестов
 * Этот файл выполняется перед каждым тестом
 */
import { beforeEach, vi } from "vitest";
import { storeToRefs } from "pinia";
import * as Vue from "vue";
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

// Мокируем definePageMeta для Nuxt страниц
vi.stubGlobal("definePageMeta", vi.fn());

// Делаем Vue composables доступными глобально (как в Nuxt auto-imports)
vi.stubGlobal("ref", Vue.ref);
vi.stubGlobal("computed", Vue.computed);
vi.stubGlobal("reactive", Vue.reactive);
vi.stubGlobal("readonly", Vue.readonly);
vi.stubGlobal("watch", Vue.watch);
vi.stubGlobal("watchEffect", Vue.watchEffect);
vi.stubGlobal("onMounted", Vue.onMounted);
vi.stubGlobal("onUnmounted", Vue.onUnmounted);
vi.stubGlobal("onBeforeMount", Vue.onBeforeMount);
vi.stubGlobal("onBeforeUnmount", Vue.onBeforeUnmount);
vi.stubGlobal("onUpdated", Vue.onUpdated);
vi.stubGlobal("onBeforeUpdate", Vue.onBeforeUpdate);
vi.stubGlobal("provide", Vue.provide);
vi.stubGlobal("inject", Vue.inject);
vi.stubGlobal("nextTick", Vue.nextTick);
vi.stubGlobal("defineProps", Vue.defineProps);
vi.stubGlobal("defineEmits", Vue.defineEmits);
vi.stubGlobal("defineExpose", Vue.defineExpose);
vi.stubGlobal("withDefaults", Vue.withDefaults);
vi.stubGlobal("useSlots", Vue.useSlots);
vi.stubGlobal("useAttrs", Vue.useAttrs);

// Сбрасываем моки перед каждым тестом
beforeEach(() => {
  vi.clearAllMocks();
  mockRouterPush.mockResolvedValue(undefined);
  mockRoute.path = "/";
});
