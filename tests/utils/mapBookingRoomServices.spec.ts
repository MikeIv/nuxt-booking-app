import { describe, it, expect } from "vitest";
import {
  mapBookingRoomsServicesToByRoom,
  parseBookingRoomService,
} from "~/utils/mapBookingRoomServices";
import type { BookingByUuidRoom } from "~/types/booking";

describe("mapBookingRoomServices", () => {
  it("parseBookingRoomService парсит объект с title и price", () => {
    const result = parseBookingRoomService(
      { title: "parking", price: "8000", package_code: "PKG_PARK" },
      1,
    );

    expect(result).toEqual({
      id: expect.any(Number),
      title: "parking",
      price: 8000,
      packageCode: "PKG_PARK",
    });
  });

  it("parseBookingRoomService парсит строку", () => {
    const result = parseBookingRoomService("Breakfast", 2);

    expect(result).toEqual({
      id: expect.any(Number),
      title: "Breakfast",
      price: 0,
    });
  });

  it("mapBookingRoomsServicesToByRoom группирует услуги по номерам", () => {
    const rooms: BookingByUuidRoom[] = [
      {
        title: "Room 1",
        tariff: { title: "Tariff", price: 76000 },
        total: 84000,
        services: [{ title: "parking", price: 8000 }],
      },
      {
        title: "Room 2",
        tariff: { title: "Tariff", price: 76000 },
        total: 94000,
        services: [{ title: "Breakfast", price: 18000 }],
      },
    ];

    const result = mapBookingRoomsServicesToByRoom(rooms);

    expect(result[0]).toHaveLength(1);
    expect(result[0]?.[0]?.title).toBe("parking");
    expect(result[0]?.[0]?.price).toBe(8000);
    expect(result[1]?.[0]?.title).toBe("Breakfast");
    expect(result[1]?.[0]?.price).toBe(18000);
    expect(result[2]).toBeUndefined();
  });
});
