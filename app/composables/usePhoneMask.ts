/**
 * Composable для работы с маской телефона в формате +7 (___) ___-__-__
 */

const PHONE_TEMPLATE = "+7 (___) ___-__-__";
const MAX_PHONE_DIGITS = 10;
const PHONE_SLOT_POSITIONS = (() => {
  const slots: number[] = [];
  for (let i = 0; i < PHONE_TEMPLATE.length; i++) {
    if (PHONE_TEMPLATE[i] === "_") slots.push(i);
  }
  return slots;
})();

const FIRST_PHONE_SLOT_POS = PHONE_SLOT_POSITIONS[0] ?? 0;

/**
 * Форматирует номер телефона в формат +7 (___) ___-__-__
 * @param digits - строка с цифрами (максимум 10 цифр)
 * @returns отформатированная строка с маской
 */
export const formatPhoneNumber = (digits: string): string => {
  const limitedDigits = digits.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS);
  const chars = PHONE_TEMPLATE.split("");
  for (let i = 0; i < PHONE_SLOT_POSITIONS.length; i++) {
    const pos = PHONE_SLOT_POSITIONS[i]!;
    chars[pos] = limitedDigits[i] ?? "_";
  }
  return chars.join("");
};

/**
 * Извлекает только цифры из отформатированной строки
 * @param value - отформатированная строка
 * @returns строка с цифрами
 */
const extractDigits = (value: string): string => {
  if (!value) return "";

  // Находим "+7" и берем все после него
  const plusSevenIndex = value.indexOf("+7");
  if (plusSevenIndex !== -1) {
    const afterPlusSeven = value.substring(plusSevenIndex + 2);
    return afterPlusSeven.replace(/\D/g, "");
  }

  return value.replace(/\D/g, "");
};

/**
 * Приводит строку к последовательности вводимых цифр (10 цифр после +7).
 */
const normalizePhoneDigits = (raw: string): string => {
  let digits = raw.replace(/\D/g, "");

  // Частый кейс: вставили 11 цифр с ведущей 7/8 (Россия)
  if (digits.length === 11 && /^[78]/.test(digits)) {
    digits = digits.slice(1);
  }

  return digits.slice(0, MAX_PHONE_DIGITS);
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/**
 * Преобразует позицию курсора в индекс слота (0..10).
 * Считаем, сколько слотов находится строго левее позиции курсора.
 */
const slotIndexFromCaretPos = (caretPos: number): number => {
  let idx = 0;
  for (const pos of PHONE_SLOT_POSITIONS) {
    if (pos < caretPos) idx++;
    else break;
  }
  return clamp(idx, 0, MAX_PHONE_DIGITS);
};

const caretPosFromSlotIndex = (slotIndex: number): number => {
  if (slotIndex <= 0) return FIRST_PHONE_SLOT_POS;
  if (slotIndex >= MAX_PHONE_DIGITS) {
    const lastPos =
      PHONE_SLOT_POSITIONS[MAX_PHONE_DIGITS - 1] ?? FIRST_PHONE_SLOT_POS;
    return clamp(lastPos + 1, FIRST_PHONE_SLOT_POS, PHONE_TEMPLATE.length);
  }
  return PHONE_SLOT_POSITIONS[slotIndex] ?? FIRST_PHONE_SLOT_POS;
};

type EditResult = { digits: string; caretSlotIndex: number };

const applyEdit = (params: {
  digits: string;
  selectionStart: number;
  selectionEnd: number;
  inputType: string;
  data: string | null;
}): EditResult => {
  let digits = params.digits.slice(0, MAX_PHONE_DIGITS);
  let startSlot = slotIndexFromCaretPos(params.selectionStart);
  let endSlot = slotIndexFromCaretPos(params.selectionEnd);

  // Нормализуем порядок выделения
  if (endSlot < startSlot) [startSlot, endSlot] = [endSlot, startSlot];

  // В обычном инпуте нельзя “вставлять в дырку” дальше конца строки
  startSlot = Math.min(startSlot, digits.length);
  endSlot = Math.min(endSlot, digits.length);

  // Если есть выделение — сначала удаляем его
  if (startSlot !== endSlot) {
    digits = digits.slice(0, startSlot) + digits.slice(endSlot);
  }

  let caretSlotIndex = startSlot;

  if (params.inputType === "deleteContentBackward") {
    if (startSlot === endSlot && caretSlotIndex > 0 && digits.length > 0) {
      digits =
        digits.slice(0, caretSlotIndex - 1) + digits.slice(caretSlotIndex);
      caretSlotIndex -= 1;
    }
    return { digits, caretSlotIndex };
  }

  if (params.inputType === "deleteContentForward") {
    if (startSlot === endSlot && caretSlotIndex < digits.length) {
      digits =
        digits.slice(0, caretSlotIndex) + digits.slice(caretSlotIndex + 1);
    }
    return { digits, caretSlotIndex };
  }

  // Любая вставка текста/пасты
  const insert = normalizePhoneDigits(params.data ?? "");
  if (insert.length === 0) return { digits, caretSlotIndex };

  for (const ch of insert) {
    if (digits.length >= MAX_PHONE_DIGITS) break;
    digits =
      digits.slice(0, caretSlotIndex) + ch + digits.slice(caretSlotIndex);
    caretSlotIndex += 1;
  }

  return { digits, caretSlotIndex };
};

/**
 * Composable для работы с маской телефона
 */
export const usePhoneMask = () => {
  // Храним digits для каждого input отдельно (10 цифр после +7)
  const inputDigits = new WeakMap<HTMLInputElement, string>();

  const getPrevDigits = (input: HTMLInputElement): string =>
    inputDigits.get(input) ??
    extractDigits(input.value).slice(0, MAX_PHONE_DIGITS);

  const syncInput = (
    input: HTMLInputElement,
    digits: string,
    caretSlotIndex: number,
    callback: (value: string) => void,
  ) => {
    const formatted = formatPhoneNumber(digits);
    const caretPos = caretPosFromSlotIndex(caretSlotIndex);

    inputDigits.set(input, digits);
    input.value = formatted;
    callback(digits);

    requestAnimationFrame(() => {
      input.setSelectionRange(caretPos, caretPos);
    });
  };

  /**
   * Обработчик ввода (желательно вешать на beforeinput, чтобы браузер
   * не “вставлял” символы внутрь маски как в обычную строку).
   */
  const handlePhoneInput = (
    event: Event,
    callback: (value: string) => void,
  ) => {
    const inputEvent = event as InputEvent;
    const input = event.target as HTMLInputElement;

    // Важный момент: чтобы не было “перемешивания”, нужно отрабатывать до изменения value.
    // Поэтому в компоненте лучше использовать @beforeinput.
    if (event.cancelable) event.preventDefault();

    const prevDigits = getPrevDigits(input);

    const selectionStart = input.selectionStart ?? FIRST_PHONE_SLOT_POS;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    const inputType = inputEvent.inputType || "insertText";
    const data = inputEvent.data ?? null;

    const { digits: nextDigits, caretSlotIndex } = applyEdit({
      digits: prevDigits,
      selectionStart,
      selectionEnd,
      inputType,
      data,
    });
    syncInput(input, nextDigits, caretSlotIndex, callback);
  };

  /**
   * Фоллбек на keydown для Backspace/Delete (на некоторых девайсах beforeinput может вести себя по-разному).
   */
  const handlePhoneKeydown = (
    event: KeyboardEvent,
    callback: (value: string) => void,
  ) => {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;
    if (key !== "Backspace" && key !== "Delete") return;

    event.preventDefault();

    const prevDigits = getPrevDigits(input);

    const selectionStart = input.selectionStart ?? FIRST_PHONE_SLOT_POS;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    const inputType =
      key === "Backspace" ? "deleteContentBackward" : "deleteContentForward";
    const { digits: nextDigits, caretSlotIndex } = applyEdit({
      digits: prevDigits,
      selectionStart,
      selectionEnd,
      inputType,
      data: null,
    });
    syncInput(input, nextDigits, caretSlotIndex, callback);
  };

  const handlePhonePaste = (
    event: ClipboardEvent,
    callback: (value: string) => void,
  ) => {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    event.preventDefault();

    const pasteText = event.clipboardData?.getData("text") ?? "";
    const prevDigits = getPrevDigits(input);

    const selectionStart = input.selectionStart ?? FIRST_PHONE_SLOT_POS;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    const { digits: nextDigits, caretSlotIndex } = applyEdit({
      digits: prevDigits,
      selectionStart,
      selectionEnd,
      inputType: "insertFromPaste",
      data: pasteText,
    });
    syncInput(input, nextDigits, caretSlotIndex, callback);
  };

  /**
   * Обработчик фокуса
   */
  const handlePhoneFocus = (
    event: Event,
    currentValue: string,
    callback: (value: string) => void,
  ) => {
    const input = event.target as HTMLInputElement;
    const digits = extractDigits(currentValue).slice(0, MAX_PHONE_DIGITS);

    // Курсор: сразу после "(" при пустом значении, иначе — после последней введённой цифры.
    const caretSlotIndex = clamp(digits.length, 0, MAX_PHONE_DIGITS);
    syncInput(input, digits, caretSlotIndex, callback);
  };

  /**
   * Обработчик потери фокуса
   */
  const handlePhoneBlur = (
    event: Event,
    currentValue: string,
    callback: (value: string) => void,
  ) => {
    const input = event.target as HTMLInputElement;
    const digits = extractDigits(currentValue).slice(0, MAX_PHONE_DIGITS);

    // Очищаем сохраненное состояние для этого input
    inputDigits.delete(input);

    // Форматируем значение (пустая строка для пустых цифр)
    const formatted = digits.length === 0 ? "" : formatPhoneNumber(digits);
    input.value = formatted;
    callback(digits);
  };

  /**
   * Получаем отформатированное значение для отображения
   */
  const getDisplayValue = (digits: string | undefined): string => {
    if (!digits || digits.trim() === "") {
      return "";
    }
    return formatPhoneNumber(digits);
  };

  return {
    formatPhoneNumber,
    handlePhoneInput,
    handlePhoneKeydown,
    handlePhonePaste,
    handlePhoneFocus,
    handlePhoneBlur,
    getDisplayValue,
    extractDigits,
  };
};
