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

export function mapBookingRoomsServicesToByRoom(
  rooms: BookingByUuidRoom[],
): Record<number, SelectedService[]> {
  const result: Record<number, SelectedService[]> = {};

  rooms.forEach((room, roomIndex) => {
    const rawServices = Array.isArray(room.services) ? room.services : [];
    const parsed = rawServices
      .map((service, serviceIndex) =>
        parseBookingRoomService(service, roomIndex * 100 + serviceIndex),
      )
      .filter((service): service is SelectedService => service !== null);

    if (parsed.length > 0) {
      result[roomIndex] = parsed;
    }
  });

  return result;
}
