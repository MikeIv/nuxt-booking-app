export function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function pickNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function pickBoolean(value: unknown): boolean {
  return value === true;
}
