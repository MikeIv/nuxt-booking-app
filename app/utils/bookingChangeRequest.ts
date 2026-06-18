import { pickBoolean, pickNumber, pickString } from "~/utils/pick";

export type BookingChangeGuest = {
  id: number | null;
  surname: string;
  name: string;
  middle_name: string | null;
  phone: string;
  email: string;
  nationality: string;
  sms_confirmation: boolean;
  email_subscribe: boolean;
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

export function resolveGuestNationality(
  guest: Record<string, unknown>,
  orderNationality: string,
): string {
  const hasNationalityField = "nationality" in guest || "country" in guest;

  if (hasNationalityField) {
    return pickString(guest.nationality) ?? pickString(guest.country) ?? "";
  }

  return orderNationality;
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
    nationality: resolveGuestNationality(guest, orderNationality),
    sms_confirmation: pickBoolean(guest.sms_confirmation),
    email_subscribe: pickBoolean(guest.email_subscribe),
  };
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

export type BookingUpdateRoomRef = {
  booking_id: number | null;
};

/** PUT booking.update: rooms[] с booking_id из GET → rooms[].id */
export function buildBookingRoomRefs(
  rooms: Record<string, unknown>[],
): BookingUpdateRoomRef[] {
  if (rooms.length === 0) return [{ booking_id: null }];
  return rooms.map((room) => ({
    booking_id: pickNumber(room.id),
  }));
}

export type BookingUpdateGuestPayload = {
  id: number | null;
  surname: string;
  name: string;
  middle_name: string | null;
  phone: string;
  email: string;
  nationality: string;
};

export type BookingContactFields = {
  name: string;
  surname: string;
  middle_name: string;
  phone: string;
  email: string;
};

export function buildContactUpdateGuest(
  guestId: number | null,
  contacts: BookingContactFields,
  nationality: string,
): BookingUpdateGuestPayload {
  return {
    id: guestId,
    surname: contacts.surname,
    name: contacts.name,
    middle_name: contacts.middle_name || null,
    phone: contacts.phone,
    email: contacts.email,
    nationality,
  };
}

type BookingUpdateRoomPatch = Record<string, unknown>;

/** Partial update: booking_id для каждой комнаты + patch только для первой */
export function mapBookingUpdateRooms(
  roomsRaw: unknown[],
  patchFirstRoom: (room: Record<string, unknown>) => BookingUpdateRoomPatch,
): Array<BookingUpdateRoomRef & BookingUpdateRoomPatch> {
  return roomsRaw.map((roomRaw, roomIndex) => {
    const room = roomRaw as Record<string, unknown>;
    const base: BookingUpdateRoomRef = {
      booking_id: pickNumber(room.id),
    };

    if (roomIndex !== 0) return base;

    return { ...base, ...patchFirstRoom(room) };
  });
}
