export interface DeclensionRules {
  one: string; // 1, 21, 31...
  few: string; // 2-4, 22-24, 32-34...
  many: string; // 5-20, 25-30, 35-40...
}

export interface WordDeclensions {
  guest: DeclensionRules;
  room: DeclensionRules;
  chamber: DeclensionRules;
  night: DeclensionRules;
  person: DeclensionRules;
  // Добавьте другие слова по необходимости
}

export const PREDEFINED_WORDS: WordDeclensions = {
  guest: {
    one: "гостя",
    few: "гостей",
    many: "гостей",
  },
  room: {
    one: "номер",
    few: "номера",
    many: "номеров",
  },
  chamber: {
    one: "комната",
    few: "комнаты",
    many: "комнат",
  },
  night: {
    one: "ночь",
    few: "ночи",
    many: "ночей",
  },
  person: {
    one: "человек",
    few: "человека",
    many: "человек",
  },
};

/**
 * Универсальная функция для склонения слов по числам
 * @param count - количество
 * @param wordKey - ключ предопределенного слова или кастомные правила
 * @returns Правильно склоненное слово
 */
export const declension = (
  count: number,
  wordKey: keyof WordDeclensions | DeclensionRules,
): string => {
  let rules: DeclensionRules;

  // Если передан ключ предопределенного слова
  if (
    typeof wordKey === "string" &&
    PREDEFINED_WORDS[wordKey as keyof WordDeclensions]
  ) {
    rules = PREDEFINED_WORDS[wordKey as keyof WordDeclensions];
  } else {
    // Если переданы кастомные правила
    rules = wordKey as DeclensionRules;
  }

  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Правила для русского языка
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return rules.many;
  }

  if (lastDigit === 1) {
    return rules.one;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return rules.few;
  }

  return rules.many;
};

/**
 * Вспомогательная функция для форматирования фразы с числом и словом
 */
export const formatCount = (
  count: number,
  wordKey: keyof WordDeclensions | DeclensionRules,
): string => {
  return `${count} ${declension(count, wordKey)}`;
};

// Утилиты для часто используемых слов
export const getGuestsWord = (count: number): string => {
  return declension(count, "guest");
};

export const getRoomsWord = (count: number): string => {
  return declension(count, "room");
};

export const getNightsWord = (count: number): string => {
  return declension(count, "night");
};
