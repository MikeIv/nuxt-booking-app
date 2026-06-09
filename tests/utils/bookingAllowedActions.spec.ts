import { describe, expect, it } from "vitest";
import {
  parseBookingAllowedActions,
  toBookingAllowedActionsArray,
} from "~/utils/bookingAllowedActions";

describe("bookingAllowedActions", () => {
  it("parseBookingAllowedActions фильтрует null и неизвестные значения", () => {
    const allowed = parseBookingAllowedActions([
      "edit-dates",
      null,
      "cancel",
      "unknown",
      "edit-contacts",
    ]);

    expect([...allowed]).toEqual(["edit-dates", "cancel", "edit-contacts"]);
  });

  it("toBookingAllowedActionsArray возвращает пустой массив для невалидного input", () => {
    expect(toBookingAllowedActionsArray(undefined)).toEqual([]);
    expect(toBookingAllowedActionsArray(null)).toEqual([]);
  });
});
