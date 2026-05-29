/**
 * Утилиты для форматирования цен
 */

/**
 * Цена за 1 ночь из итога за период проживания (как в ответе API /v1/search).
 */
export const toPricePerNight = (
  stayTotal: number | null | undefined,
  nights: number,
): number => {
  const total = stayTotal ?? 0;
  if (nights <= 0) return total;
  return total / nights;
};

/**
 * Итог за период из цены за 1 ночь (контракт SelectedEntry.price).
 */
export const toStayTotal = (
  pricePerNight: number | null | undefined,
  nights: number,
): number => {
  const perNight = pricePerNight ?? 0;
  if (nights <= 0) return perNight;
  return perNight * nights;
};

/**
 * Форматирует число или строку в цену с разделителями тысяч
 * @param price - цена (число или строка)
 * @returns Отформатированная цена в виде строки
 */
export const formatPrice = (
  price: number | string | undefined | null,
): string => {
  if (price === undefined || price === null) return "0";

  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numPrice)) return "0";

  return numPrice.toLocaleString("ru-RU");
};
