import type { Room, RoomTariff } from "~/types/room";

export interface MultiBookingGuests {
  rooms: number;
  roomList?: unknown[];
}

export const MULTI_BOOKING_UNAVAILABLE_TOAST = {
  severity: "warn" as const,
  summary: "Номера недоступны",
  detail:
    "Для выбранного состава гостей не все номера доступны. Измените параметры в блоке «Гости».",
  life: 5000,
};

export function normalizeRoomIndex(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}

export function getExpectedRoomCount(guests: MultiBookingGuests): number {
  return guests.roomList?.length ?? guests.rooms ?? 1;
}

/** Есть ли у тарифа явная цена для конкретного номера в room_prices */
export function hasTariffRoomPrice(
  tariff: RoomTariff,
  roomIndex: number,
): boolean {
  if (!tariff.room_prices?.length) return false;
  return tariff.room_prices.some(
    (entry) => normalizeRoomIndex(entry.room_index) === roomIndex,
  );
}

/**
 * Индексы номеров (0-based) для отображения строк тарифа.
 * При наличии room_prices — только номера с явной ценой.
 */
export function getTariffRoomIndices(
  tariff: RoomTariff,
  expectedRoomCount: number,
): number[] {
  const indices = Array.from({ length: expectedRoomCount }, (_, i) => i);
  if (!tariff.room_prices?.length) return indices;
  return indices.filter((index) => hasTariffRoomPrice(tariff, index));
}

/**
 * Итог за период для конкретного номера в тарифе.
 * Если room_prices задан — только явная цена по room_index (без fallback на tariff.price).
 */
export function getTariffStayTotalForRoom(
  tariff: RoomTariff,
  roomIndex: number,
): number | null {
  if (tariff.room_prices?.length) {
    const roomPrice = tariff.room_prices.find(
      (entry) => normalizeRoomIndex(entry.room_index) === roomIndex,
    );
    return roomPrice?.price ?? null;
  }
  return tariff.price ?? null;
}

/**
 * Индексы номеров (0-based), для которых нет ни одной цены в ответе поиска.
 */
export function getUnavailableRoomIndices(
  rooms: Room[],
  expectedRoomCount: number,
): number[] {
  if (expectedRoomCount <= 1 || rooms.length === 0) return [];

  const unavailable: number[] = [];
  for (let roomIndex = 0; roomIndex < expectedRoomCount; roomIndex++) {
    const hasPrice = rooms.some((room) =>
      room.tariffs?.some((tariff) => hasTariffRoomPrice(tariff, roomIndex)),
    );
    if (!hasPrice) unavailable.push(roomIndex);
  }
  return unavailable;
}

/**
 * Возвращает массив выбранных номеров мультибронирования, отсортированный по логическому roomIdx.
 * Ключи в selectedMultiRooms могут быть композитными (card-roomIdx), поэтому для per-room данных
 * (услуги/packages, гости) всегда используем roomIdx из записей.
 */
export function getSortedMultiRoomEntries<T extends { roomIdx: number }>(
  record: Record<string, T> | null | undefined,
): T[] {
  if (!record) return [];
  return Object.values(record).sort((a, b) => a.roomIdx - b.roomIdx);
}
