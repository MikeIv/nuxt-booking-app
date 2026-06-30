import type {
  BookingByUuidPayload,
  BookingByUuidRoom,
  BookingHistoryItem,
  BookingResponse,
} from "~/types/booking";
import { toBookingAllowedActionsArray } from "~/utils/bookingAllowedActions";
import { mapBookingRoomServicesToTitles } from "~/utils/mapBookingRoomServices";

export function parseBookingRooms(
  rooms: BookingByUuidPayload["rooms"],
): BookingByUuidRoom[] {
  if (typeof rooms === "string") {
    try {
      const parsed = JSON.parse(rooms) as BookingByUuidRoom[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(rooms) ? rooms : [];
}

/** Нормализация ответа GET /v1/booking/{uuid} для createdBooking и смены услуг */
export function normalizeBookingByUuidPayload(
  raw: BookingByUuidPayload,
): BookingResponse {
  return {
    id: raw.id,
    uuid: raw.uuid,
    number:
      raw.number != null && String(raw.number).trim() !== ""
        ? String(raw.number).trim()
        : undefined,
    confirmation_number: raw.confirmation_number,
    status: raw.status,
    allowed: toBookingAllowedActionsArray(raw.allowed),
    hotel: raw.hotel,
    order: {
      ...raw.order,
      nights: Number(raw.order.nights) || 0,
    } as BookingResponse["order"],
    rooms: parseBookingRooms(raw.rooms),
    total_price: raw.total_price,
    payment: raw.payment,
  };
}

function mapRoom(
  room: BookingByUuidRoom,
  index: number,
): BookingHistoryItem["rooms"][number] {
  const guestsList = room.guests ?? [];
  const mainGuest =
    guestsList.find((guest) => guest.is_main === true) ?? guestsList[0];

  return {
    id: room.id ?? index + 1,
    title: room.title,
    tariff: room.tariff,
    guests: {
      main: {
        name: mainGuest?.name ?? "",
        surname: mainGuest?.surname ?? "",
        email: mainGuest?.email ?? "",
        phone: mainGuest?.phone,
      },
      adults: room.adults ?? 0,
      children: room.children ?? 0,
      total: room.total_guests ?? guestsList.length,
    },
    services: mapBookingRoomServicesToTitles(room),
    total: room.total,
  };
}

export function mapBookingShowToHistoryItem(
  raw: BookingByUuidPayload,
): BookingHistoryItem {
  const rooms = parseBookingRooms(raw.rooms).map(mapRoom);
  const order = raw.order;

  return {
    id: raw.id || raw.uuid,
    uuid: raw.uuid,
    number:
      raw.number != null && String(raw.number).trim() !== ""
        ? String(raw.number).trim()
        : raw.number,
    confirmation_number: raw.confirmation_number ?? null,
    status: raw.status,
    allowed: toBookingAllowedActionsArray(raw.allowed),
    order: {
      name: order.name,
      surname: order.surname,
      nationality: order.nationality,
      comment: order.comment ?? null,
      payment_method:
        "payment_method" in order && typeof order.payment_method === "string"
          ? order.payment_method
          : "",
      payment_cancelled: order.payment_cancelled,
      start_at: order.start_at,
      end_at: order.end_at,
      nights: Number(order.nights) || 0,
      pdf: order.pdf ?? "",
    },
    rooms,
    total_price: raw.total_price,
  };
}
