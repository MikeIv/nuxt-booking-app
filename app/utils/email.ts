/**
 * Практичное подмножество RFC 5321 / HTML5: только ASCII, обязательный домен и TLD.
 */
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const EMAIL_INVALID_MESSAGE = "Введите корректный email";

export const isValidEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value.trim());
