import type { UseHeadInput } from "@unhead/schema";

/**
 * Shim для Nuxt virtual module `#imports` в Vitest.
 * В приложении эти composables авто-импортируются Nuxt'ом,
 * а в юнит-тестах достаточно no-op реализаций.
 */
export function useHead(_input: UseHeadInput) {
  // no-op
}

export function useSeoMeta(_input: Record<string, unknown>) {
  // no-op
}
