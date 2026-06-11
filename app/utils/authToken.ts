import type { RefreshTokenResponse } from "~/types/auth";

interface RefreshApiResponse {
  success: boolean;
  payload?: (Partial<RefreshTokenResponse> & { token?: string }) | null;
}

/** Поддерживает accessToken (актуальный API) и token (legacy). */
export function extractAccessToken(
  payload?: (Partial<RefreshTokenResponse> & { token?: string }) | null,
): string | null {
  if (!payload) return null;
  return payload.accessToken ?? payload.token ?? null;
}

export function buildAuthHeaders(
  token: string | null,
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function normalizeApiBaseUrl(apiBase: string): string {
  return apiBase.replace(/\/v1\/?$/, "").replace(/\/$/, "");
}

export function getFetchErrorStatus(error: unknown): number | undefined {
  return (error as { status?: number }).status;
}

export function isAuthErrorStatus(status?: number): boolean {
  return status === 401 || status === 403;
}

export function shouldLogoutOnRefreshError(error: unknown): boolean {
  return (
    isAuthErrorStatus(getFetchErrorStatus(error)) ||
    (error as { isRefreshError?: boolean }).isRefreshError === true
  );
}

export async function fetchRefreshedAccessToken(
  baseURL: string,
  currentToken: string | null,
): Promise<string> {
  const response = await $fetch<RefreshApiResponse>("/v1/auth/refresh", {
    method: "POST",
    baseURL,
    credentials: "include",
    headers: buildAuthHeaders(currentToken),
  });

  const accessToken = extractAccessToken(response.payload);

  if (!response.success || !accessToken) {
    const error = new Error("Failed to refresh token") as Error & {
      isRefreshError?: boolean;
    };
    error.isRefreshError = true;
    throw error;
  }

  return accessToken;
}
