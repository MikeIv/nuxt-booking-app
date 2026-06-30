import { describe, it, expect } from "vitest";
import {
  buildBookingRoomRefs,
  buildContactUpdateGuest,
  buildSelectedMultiRoomsFromBookingRooms,
  mapBookingChangeGuest,
  mapBookingUpdateRooms,
  mapBookingUpdateRoomsPackages,
  pickBookingStayDates,
  pickPackageCode,
  pickRoomPackageCodes,
  pickRoomRatePlanCode,
  resolveBookingNights,
  resolveGuestNationality,
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
    it("должен подставлять nationality из заказа, если у гостя нет поля nationality", () => {
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

    it("должен сохранять nationality гостя, если поле уже есть в ответе API", () => {
      expect(
        mapBookingChangeGuest(
          {
            id: 1,
            surname: "Ivanov",
            name: "Ivan",
            nationality: "Австрия",
          },
          "Россия",
        ),
      ).toEqual(
        expect.objectContaining({
          nationality: "Австрия",
        }),
      );
    });

    it("должен сохранять sms_confirmation и email_subscribe", () => {
      expect(
        mapBookingChangeGuest(
          {
            id: 1,
            surname: "Ivanov",
            name: "Ivan",
            sms_confirmation: true,
            email_subscribe: true,
          },
          "",
        ),
      ).toEqual(
        expect.objectContaining({
          sms_confirmation: true,
          email_subscribe: true,
        }),
      );
    });
  });

  describe("resolveGuestNationality", () => {
    it("должен использовать order.nationality, если у гостя нет поля nationality", () => {
      expect(resolveGuestNationality({ name: "test" }, "Австрия")).toBe(
        "Австрия",
      );
    });

    it("должен не подменять nationality из order, если поле nationality есть у гостя", () => {
      expect(
        resolveGuestNationality({ nationality: "Германия" }, "Австрия"),
      ).toBe("Германия");
    });
  });

  describe("buildBookingRoomRefs", () => {
    it("должен передавать только booking_id для каждой комнаты", () => {
      expect(
        buildBookingRoomRefs([
          { id: 334, room_type_code: "SSK", guests: [{ id: 1 }] },
          { id: 335 },
        ]),
      ).toEqual([{ booking_id: 334 }, { booking_id: 335 }]);
    });
  });

  describe("mapBookingUpdateRooms", () => {
    it("должен добавлять patch только для первой комнаты", () => {
      expect(
        mapBookingUpdateRooms([{ id: 1 }, { id: 2 }], () => ({
          packages: ["SPA"],
        })),
      ).toEqual([{ booking_id: 1, packages: ["SPA"] }, { booking_id: 2 }]);
    });
  });

  describe("mapBookingUpdateRoomsPackages", () => {
    it("должен добавлять packages для каждой комнаты", () => {
      expect(
        mapBookingUpdateRoomsPackages([{ id: 1 }, { id: 2 }], (index) =>
          index === 0 ? ["SPA"] : ["PARKING"],
        ),
      ).toEqual([
        { booking_id: 1, packages: ["SPA"] },
        { booking_id: 2, packages: ["PARKING"] },
      ]);
    });
  });

  describe("buildSelectedMultiRoomsFromBookingRooms", () => {
    it("должен собирать selectedMultiRooms по каждому номеру", () => {
      expect(
        buildSelectedMultiRoomsFromBookingRooms(
          [
            {
              id: 1,
              title: "Номер 1",
              room_type_code: "DLT",
              rate_plan_code: "H-BBB",
              tariff: { title: "BB", price: 20000 },
              total: 20000,
            },
            {
              id: 2,
              title: "Номер 2",
              room_type_code: "SSK",
              rate_plan_code: "H-BBB",
              tariff: { title: "BB", price: 15000 },
              total: 15000,
            },
          ],
          2,
        ),
      ).toEqual({
        "0": expect.objectContaining({
          roomIdx: 0,
          room_type_code: "DLT",
          ratePlanCode: "H-BBB",
        }),
        "1": expect.objectContaining({
          roomIdx: 1,
          room_type_code: "SSK",
          ratePlanCode: "H-BBB",
        }),
      });
    });
  });

  describe("resolveBookingNights", () => {
    it("должен использовать nights из order, если они заданы", () => {
      expect(
        resolveBookingNights({
          start_at: "2026-06-27",
          end_at: "2026-06-28",
          nights: 3,
        }),
      ).toBe(3);
    });
  });

  describe("buildContactUpdateGuest", () => {
    it("должен собирать payload гостя для PUT контактов", () => {
      expect(
        buildContactUpdateGuest(
          42,
          {
            surname: "Иванов",
            name: "Пётр",
            middle_name: "Сергеевич",
            phone: "+79991234567",
            email: "ivanov@mail.ru",
          },
          "RU",
        ),
      ).toEqual({
        id: 42,
        surname: "Иванов",
        name: "Пётр",
        middle_name: "Сергеевич",
        phone: "+79991234567",
        email: "ivanov@mail.ru",
        nationality: "RU",
      });
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
