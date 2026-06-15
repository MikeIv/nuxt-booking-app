import type { SelectedService } from "~/stores/booking";
import type { BookingByUuidRoom } from "~/types/booking";
import { pickNumber, pickString } from "~/utils/pick";

const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export function parseBookingRoomService(
  service: unknown,
  fallbackId: number,
): SelectedService | null {
  if (typeof service === "string" && service.trim() !== "") {
    return {
      id: hashStringToNumber(service) || fallbackId,
      title: service.trim(),
      price: 0,
    };
  }

  if (!service || typeof service !== "object") return null;

  const record = service as Record<string, unknown>;
  const title =
    pickString(record.title) ??
    pickString(record.name) ??
    pickString(record.package_code) ??
    pickString(record.code);

  if (!title) return null;

  const price =
    pickNumber(record.price) ??
    pickNumber(record.amount) ??
    pickNumber(record.total) ??
    0;

  const packageCode =
    pickString(record.package_code) ?? pickString(record.code) ?? undefined;

  const id =
    pickNumber(record.id) ??
    (packageCode ? hashStringToNumber(packageCode) : null) ??
    fallbackId;

  return {
    id,
    title,
    price,
    packageCode,
  };
}

/** Доп. услуги номера из booking.show: приоритет у packages, fallback — services */
function getBookingRoomExtraServicesRaw(room: BookingByUuidRoom): unknown[] {
  const packages = room.packages;
  if (Array.isArray(packages) && packages.length > 0) {
    return packages;
  }

  const services = room.services;
  return Array.isArray(services) ? services : [];
}

function parseBookingRoomExtraServices(
  room: BookingByUuidRoom,
  idOffset = 0,
): SelectedService[] {
  return getBookingRoomExtraServicesRaw(room)
    .map((service, serviceIndex) =>
      parseBookingRoomService(service, idOffset + serviceIndex),
    )
    .filter((service): service is SelectedService => service !== null);
}

export function mapBookingRoomServicesToTitles(
  room: BookingByUuidRoom,
): string[] {
  return parseBookingRoomExtraServices(room).map((service) => service.title);
}

export function mapBookingRoomsServicesToByRoom(
  rooms: BookingByUuidRoom[],
): Record<number, SelectedService[]> {
  const result: Record<number, SelectedService[]> = {};

  rooms.forEach((room, roomIndex) => {
    const parsed = parseBookingRoomExtraServices(room, roomIndex * 100);

    if (parsed.length > 0) {
      result[roomIndex] = parsed;
    }
  });

  return result;
}
