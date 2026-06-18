import { describe, it, expect } from "vitest";
import {
  mapBookingChangeGuest,
  pickBookingStayDates,
  pickPackageCode,
  pickRoomPackageCodes,
  pickRoomRatePlanCode,
} from "~/utils/bookingChangeRequest";

describe("bookingChangeRequest", () => {
  describe("pickRoomRatePlanCode", () => {
    it("должен предпочитать rate_plan_code перед rate_type_code", () => {
      expect(
        pickRoomRatePlanCode({
          rate_plan_code: "H-BBB",
          rate_type_code: "WRONG",
        }),
      ).toBe("H-BBB");
    });
  });

  describe("pickPackageCode", () => {
    it("должен извлекать package_code из объекта", () => {
      expect(pickPackageCode({ package_code: "PARKING" })).toBe("PARKING");
    });
  });

  describe("pickRoomPackageCodes", () => {
    it("должен собирать коды пакетов из строк и объектов", () => {
      expect(
        pickRoomPackageCodes({
          packages: ["SPA", { package_code: "PARKING" }],
        }),
      ).toEqual(["SPA", "PARKING"]);
    });
  });

  describe("mapBookingChangeGuest", () => {
    it("должен подставлять nationality из заказа", () => {
      expect(
        mapBookingChangeGuest(
          { id: 1, surname: "Ivanov", name: "Ivan", email: "a@b.c" },
          "Россия",
        ),
      ).toEqual(
        expect.objectContaining({
          nationality: "Россия",
        }),
      );
    });
  });

  describe("pickBookingStayDates", () => {
    it("должен возвращать даты в формате YYYY-MM-DD", () => {
      expect(
        pickBookingStayDates({
          start_at: "2026-06-27T14:00:00",
          end_at: "2026-06-28T12:00:00",
        }),
      ).toEqual({
        startAt: "2026-06-27",
        endAt: "2026-06-28",
      });
    });
  });
});
