/**
 * Утилиты для форматирования цен
 */

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
