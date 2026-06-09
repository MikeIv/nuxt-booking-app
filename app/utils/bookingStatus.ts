const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "создано, ожидает оплаты или подтверждения",
  processing: "оплата/синхронизация в обработке",
  confirmed: "подтверждено",
  cancelled: "отменено",
  completed: "завершено",
  reversed: "платежная операция отменена до финального списания",
  refunded: "выполнен возврат",
  rejected: "платеж отклонен",
  failed: "платеж/операция завершились ошибкой",
  error: "ошибка обработки бронирования или синхронизации",
};

export function getBookingStatusLabel(
  status: string | undefined | null,
): string {
  if (!status) {
    return "—";
  }

  return BOOKING_STATUS_LABELS[status.toLowerCase()] ?? status;
}

export function getBookingDisplayNumber(booking: {
  number?: string | null;
  confirmation_number?: string | null;
  id: string | number;
}): string {
  const number = booking.number?.trim();
  if (number) {
    return number;
  }

  const confirmationNumber = booking.confirmation_number?.trim();
  if (confirmationNumber) {
    return confirmationNumber;
  }

  return String(booking.id);
}
