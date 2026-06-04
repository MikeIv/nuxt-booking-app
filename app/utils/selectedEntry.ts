import type { SelectedEntry } from "~/types/booking";
import type { Room } from "~/types/room";

export interface BuildSelectedEntryParams {
  room: Room;
  ratePlanCode: string;
  tariffTitle: string;
  /** Цена за 1 ночь */
  pricePerNight: number | null | undefined;
  roomIdx?: number;
  roomCardIdx?: number;
}

/** Запись выбранного номера для сводки и persist (single / multi) */
export function buildSelectedEntry({
  room,
  ratePlanCode,
  tariffTitle,
  pricePerNight,
  roomIdx = 0,
  roomCardIdx = 0,
}: BuildSelectedEntryParams): SelectedEntry {
  return {
    roomIdx,
    roomCardIdx,
    roomTitle: room.title || "",
    room_type_code: room.room_type_code,
    ratePlanCode,
    price: pricePerNight,
    title: tariffTitle || "",
    square: room.square,
  };
}
