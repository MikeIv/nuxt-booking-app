import type { BookingAllowedAction } from "~/types/booking";

const BOOKING_ALLOWED_ACTIONS: readonly BookingAllowedAction[] = [
  "edit-dates",
  "edit-number",
  "edit-packages",
  "edit-contacts",
  "cancel",
] as const;

function isBookingAllowedAction(
  action: unknown,
): action is BookingAllowedAction {
  return (
    typeof action === "string" &&
    (BOOKING_ALLOWED_ACTIONS as readonly string[]).includes(action)
  );
}

export function parseBookingAllowedActions(
  allowed: Array<BookingAllowedAction | null> | undefined | null,
): Set<BookingAllowedAction> {
  if (!Array.isArray(allowed)) {
    return new Set();
  }

  return new Set(
    allowed.filter((action): action is BookingAllowedAction =>
      isBookingAllowedAction(action),
    ),
  );
}

export function toBookingAllowedActionsArray(
  allowed: Array<BookingAllowedAction | null> | undefined | null,
): BookingAllowedAction[] {
  return [...parseBookingAllowedActions(allowed)];
}
