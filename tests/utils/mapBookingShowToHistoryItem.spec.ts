import { describe, it, expect } from "vitest";
import {
  mapBookingShowToHistoryItem,
  normalizeBookingByUuidPayload,
} from "~/utils/mapBookingShowToHistoryItem";
import type { BookingByUuidPayload } from "~/types/booking";

describe("mapBookingShowToHistoryItem", () => {
  it("маппит packages в services для booking-details", () => {
    const payload: BookingByUuidPayload = {
      id: "167",
      uuid: "5af9d27b-8ba4-4881-b7b1-78bf4c11c51c",
      number: "BW-2026-06-19-167",
      status: "confirmed",
      order: {
        name: "Ivan",
        surname: "Ivanov",
        nationality: "RU",
        comment: null,
        payment_cancelled: "",
        start_at: "2026-06-20",
        end_at: "2026-06-21",
        nights: 1,
        pdf: "",
      },
      rooms: [
        {
          id: 318,
          title: "Grand Deluxe King Room",
          tariff: { title: "Предоплатный тариф без завтрака", price: 76000 },
          adults: 1,
          children: 0,
          total: 85000,
          packages: [
            {
              code: "BFSTA",
              title: "Breakfast",
              price: 9000,
              calculation_rate_title: null,
            },
          ],
        },
      ],
      total_price: 85000,
      payment: null,
    };

    const result = mapBookingShowToHistoryItem(payload);

    expect(result.rooms[0]?.services).toEqual(["Breakfast"]);
  });

  it("normalizeBookingByUuidPayload сохраняет сырые rooms для смены услуг", () => {
    const payload: BookingByUuidPayload = {
      id: "167",
      uuid: "5af9d27b-8ba4-4881-b7b1-78bf4c11c51c",
      number: "BW-2026-06-19-167",
      status: "confirmed",
      order: {
        name: "Ivan",
        surname: "Ivanov",
        nationality: "RU",
        comment: null,
        payment_cancelled: "",
        start_at: "2026-06-20",
        end_at: "2026-06-21",
        nights: 1,
        pdf: "",
      },
      rooms: [
        {
          id: 318,
          title: "Grand Deluxe King Room",
          room_type_code: "DLT",
          rate_plan_code: "H-BBB",
          tariff: { title: "BB", price: 76000 },
          adults: 1,
          children: 0,
          total: 85000,
        },
      ],
      total_price: 85000,
      payment: null,
    };

    const result = normalizeBookingByUuidPayload(payload);

    expect(result.rooms).toEqual([
      expect.objectContaining({
        room_type_code: "DLT",
        rate_plan_code: "H-BBB",
      }),
    ]);
  });
});
