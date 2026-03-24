import type { BookingResponse, ContactFormData } from "~/types/booking";
import type { User } from "~/stores/auth";

/**
 * Извлекает контактные данные из объекта бронирования с каскадным fallback:
 * данные заказа → данные гостя → данные авторизованного пользователя → ""
 *
 * Используется в useBookingChangeDates и useBookingChangeContacts.
 */
export function buildBookingContactFallback(
  booking: BookingResponse | null,
  user: User | null,
): ContactFormData {
  const order = booking?.order;
  const firstRoom = Array.isArray(booking?.rooms)
    ? (booking.rooms[0] as Record<string, unknown> | undefined)
    : undefined;
  const guests = Array.isArray(firstRoom?.guests)
    ? (firstRoom.guests as Array<Record<string, unknown>>)
    : [];
  const mainGuest = guests.find((g) => g.is_main === true) ?? guests[0] ?? null;

  return {
    name:
      (typeof order?.name === "string" ? order.name : "") ||
      (typeof mainGuest?.name === "string" ? mainGuest.name : "") ||
      user?.name ||
      "",
    surname:
      (typeof order?.surname === "string" ? order.surname : "") ||
      (typeof mainGuest?.surname === "string" ? mainGuest.surname : "") ||
      user?.surname ||
      "",
    middle_name:
      (typeof mainGuest?.middle_name === "string"
        ? mainGuest.middle_name
        : "") ||
      user?.middle_name ||
      "",
    phone:
      (typeof mainGuest?.phone === "string" ? mainGuest.phone : "") ||
      user?.phone ||
      "",
    email:
      (typeof mainGuest?.email === "string" ? mainGuest.email : "") ||
      user?.email ||
      "",
    country:
      (typeof order?.nationality === "string" ? order.nationality : "") ||
      user?.country ||
      "",
  };
}
