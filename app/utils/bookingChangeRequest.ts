import { pickNumber, pickString } from "~/utils/pick";

export type BookingChangeGuest = {
  id: number | null;
  surname: string;
  name: string;
  middle_name: string | null;
  phone: string;
  email: string;
  nationality: string;
};

export function pickRoomRatePlanCode(
  room: Record<string, unknown>,
  fallback = "",
): string {
  return (
    pickString(room.rate_plan_code) ??
    pickString(room.ratePlanCode) ??
    pickString(room.rate_type_code) ??
    pickString(room.rateTypeCode) ??
    fallback
  );
}

export function pickPackageCode(pkg: unknown): string | null {
  const direct = pickString(pkg);
  if (direct) return direct;
  if (!pkg || typeof pkg !== "object") return null;
  const record = pkg as Record<string, unknown>;
  return pickString(record.package_code) ?? pickString(record.code) ?? null;
}

export function pickRoomPackageCodes(room: Record<string, unknown>): string[] {
  const packagesRaw = Array.isArray(room.packages) ? room.packages : [];
  return packagesRaw
    .map((pkg) => pickPackageCode(pkg))
    .filter((pkg): pkg is string => pkg !== null);
}

export function pickChildrenAges(room: Record<string, unknown>): number[] {
  const agesRaw = Array.isArray(room.children_ages) ? room.children_ages : [];
  return agesRaw
    .map((age) => pickNumber(age))
    .filter((age): age is number => age !== null);
}

export function mapBookingChangeGuest(
  guestRaw: unknown,
  orderNationality: string,
): BookingChangeGuest {
  const guest = guestRaw as Record<string, unknown>;
  return {
    id: pickNumber(guest.id),
    surname: pickString(guest.surname) ?? "",
    name: pickString(guest.name) ?? "",
    middle_name: pickString(guest.middle_name),
    phone: pickString(guest.phone) ?? "",
    email: pickString(guest.email) ?? "",
    nationality: pickString(guest.nationality) ?? orderNationality,
  };
}

export function mapBookingChangeGuests(
  guestsRaw: unknown[],
  orderNationality: string,
): BookingChangeGuest[] {
  return guestsRaw.map((guestRaw) =>
    mapBookingChangeGuest(guestRaw, orderNationality),
  );
}

export function pickBookingStayDates(
  order: { start_at?: string; end_at?: string } | null | undefined,
): { startAt: string; endAt: string } | null {
  const startAtRaw = typeof order?.start_at === "string" ? order.start_at : "";
  const endAtRaw = typeof order?.end_at === "string" ? order.end_at : "";
  const startAt = startAtRaw.slice(0, 10);
  const endAt = endAtRaw.slice(0, 10);
  if (!startAt || !endAt) return null;
  return { startAt, endAt };
}
