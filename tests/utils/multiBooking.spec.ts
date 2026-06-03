import { describe, it, expect } from "vitest";
import type { Room, RoomTariff } from "~/types/room";
import {
  getTariffStayTotalForRoom,
  getTariffRoomIndices,
  getUnavailableRoomIndices,
  getExpectedRoomCount,
  hasTariffRoomPrice,
  normalizeRoomIndex,
} from "~/utils/multiBooking";

const makeTariff = (overrides: Partial<RoomTariff> = {}): RoomTariff => ({
  rate_plan_code: "H-BBB",
  title: "Гибкий тариф",
  price: 85000,
  packages: [],
  ...overrides,
});

describe("multiBooking utils", () => {
  describe("normalizeRoomIndex", () => {
    it("приводит строковый room_index к числу", () => {
      expect(normalizeRoomIndex("0")).toBe(0);
      expect(normalizeRoomIndex(1)).toBe(1);
    });
  });

  describe("hasTariffRoomPrice", () => {
    it("возвращает false, если room_prices отсутствует", () => {
      expect(hasTariffRoomPrice(makeTariff(), 0)).toBe(false);
    });

    it("находит цену по room_index", () => {
      const tariff = makeTariff({
        room_prices: [
          {
            room_index: 0,
            room_number: 1,
            room_type_code: "DLK",
            rate_plan_code: "H-BBB",
            price: 85000,
          },
        ],
      });
      expect(hasTariffRoomPrice(tariff, 0)).toBe(true);
      expect(hasTariffRoomPrice(tariff, 1)).toBe(false);
    });
  });

  describe("getTariffStayTotalForRoom", () => {
    it("возвращает цену из room_prices по room_index", () => {
      const tariff = makeTariff({
        room_prices: [
          {
            room_index: 0,
            room_number: 1,
            room_type_code: "DLK",
            rate_plan_code: "H-BBB",
            price: 85000,
          },
          {
            room_index: 1,
            room_number: 2,
            room_type_code: "DLK",
            rate_plan_code: "H-BBB",
            price: 87500,
          },
        ],
      });

      expect(getTariffStayTotalForRoom(tariff, 0)).toBe(85000);
      expect(getTariffStayTotalForRoom(tariff, 1)).toBe(87500);
    });

    it("возвращает null, если room_prices есть, но нет записи для индекса", () => {
      const tariff = makeTariff({
        price: 80000,
        room_prices: [
          {
            room_index: 0,
            room_number: 1,
            room_type_code: "DLK",
            rate_plan_code: "H-BBB",
            price: 85000,
          },
        ],
      });

      expect(getTariffStayTotalForRoom(tariff, 1)).toBeNull();
    });

    it("fallback на tariff.price, если room_prices отсутствует", () => {
      const tariff = makeTariff({ price: 77000 });
      expect(getTariffStayTotalForRoom(tariff, 0)).toBe(77000);
    });
  });

  describe("getExpectedRoomCount", () => {
    it("берёт длину roomList, если она задана", () => {
      expect(getExpectedRoomCount({ rooms: 1, roomList: [{}, {}, {}] })).toBe(
        3,
      );
    });
  });

  describe("getTariffRoomIndices", () => {
    it("возвращает только индексы с room_prices", () => {
      const tariff = makeTariff({
        room_prices: [
          {
            room_index: 0,
            room_number: 1,
            room_type_code: "DLK",
            rate_plan_code: "H-BBB",
            price: 85000,
          },
        ],
      });
      expect(getTariffRoomIndices(tariff, 3)).toEqual([0]);
    });
  });

  describe("getUnavailableRoomIndices", () => {
    const rooms: Room[] = [
      {
        room_type_code: "DLK",
        title: "Deluxe",
        description: null,
        max_occupancy: 2,
        square: 30,
        rooms: 1,
        amenities: [],
        min_price: 85000,
        photos: [],
        tariffs: [
          makeTariff({
            room_prices: [
              {
                room_index: 0,
                room_number: 1,
                room_type_code: "DLK",
                rate_plan_code: "H-BBB",
                price: 85000,
              },
              {
                room_index: 1,
                room_number: 2,
                room_type_code: "DLK",
                rate_plan_code: "H-BBB",
                price: 87500,
              },
            ],
          }),
        ],
      },
    ];

    it("возвращает пустой массив, если все номера доступны", () => {
      expect(getUnavailableRoomIndices(rooms, 2)).toEqual([]);
    });

    it("возвращает индексы недоступных номеров", () => {
      const partialRooms: Room[] = [
        {
          ...rooms[0],
          tariffs: [
            makeTariff({
              room_prices: [
                {
                  room_index: 0,
                  room_number: 1,
                  room_type_code: "DLK",
                  rate_plan_code: "H-BBB",
                  price: 85000,
                },
              ],
            }),
          ],
        },
      ];

      expect(getUnavailableRoomIndices(partialRooms, 3)).toEqual([1, 2]);
    });

    it("возвращает пустой массив для одиночного бронирования", () => {
      expect(getUnavailableRoomIndices(rooms, 1)).toEqual([]);
    });

    it("возвращает пустой массив при пустом ответе (обрабатывается отдельно на уровне search)", () => {
      expect(getUnavailableRoomIndices([], 2)).toEqual([]);
    });

    it("не считает тариф без room_prices доступным для multi", () => {
      const legacyTariffRooms: Room[] = [
        {
          ...rooms[0],
          tariffs: [makeTariff({ price: 64000 })],
        },
      ];

      expect(getUnavailableRoomIndices(legacyTariffRooms, 3)).toEqual([
        0, 1, 2,
      ]);
    });
  });
});
