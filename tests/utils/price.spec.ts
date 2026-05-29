import { describe, expect, it } from "vitest";
import { toPricePerNight, toStayTotal } from "~/utils/price";

describe("price utils", () => {
  it("toPricePerNight делит итог за период на количество ночей", () => {
    expect(toPricePerNight(160_000, 2)).toBe(80_000);
    expect(toPricePerNight(160_000, 1)).toBe(160_000);
  });

  it("toPricePerNight при нуле ночей возвращает исходную сумму", () => {
    expect(toPricePerNight(160_000, 0)).toBe(160_000);
  });

  it("toStayTotal восстанавливает итог из цены за ночь", () => {
    expect(toStayTotal(80_000, 2)).toBe(160_000);
    expect(toStayTotal(80_000, 1)).toBe(80_000);
  });
});
