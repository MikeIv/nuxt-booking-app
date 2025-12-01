/**
 * Утилиты для работы с возрастом детей
 */

export const AGE_MIN = 0;
export const AGE_MAX = 12;
export const AGE_OPTIONS = Array.from(
  { length: AGE_MAX - AGE_MIN + 1 },
  (_, i) => i + AGE_MIN,
);

/**
 * Получить правильное склонение слова "лет" для возраста
 */
export function getAgeLabel(age: number): string {
  if (age === 0) return "лет";
  if (age === 1) return "год";
  if (age >= 2 && age <= 4) return "года";
  return "лет";
}

/**
 * Получить опции возраста для селекта
 */
export function getAgeOptions() {
  return AGE_OPTIONS.map((age) => ({
    value: age,
    label: `${age} ${getAgeLabel(age)}`,
  }));
}

/**
 * Получить метку для возраста ребенка
 */
export function childAgeLabel(
  totalChildren: number,
  index1Based: number,
): string {
  if (totalChildren === 1) return "Возраст ребенка";
  if (index1Based === 1) return "Возраст 1-го ребенка";
  if (index1Based === 2) return "Возраст 2-го ребенка";
  return `Возраст ${index1Based}-го ребенка`;
}
