import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import type { BookingAllowedAction } from "~/types/booking";
import { parseBookingAllowedActions } from "~/utils/bookingAllowedActions";

export const useBookingAllowedActions = (
  allowedSource: MaybeRefOrGetter<
    Array<BookingAllowedAction | null> | undefined | null
  >,
) => {
  const allowedActions = computed(() =>
    parseBookingAllowedActions(toValue(allowedSource)),
  );

  const canEditDates = computed(() => allowedActions.value.has("edit-dates"));
  const canEditRoom = computed(() => allowedActions.value.has("edit-number"));
  const canEditPackages = computed(() =>
    allowedActions.value.has("edit-packages"),
  );
  const canEditContacts = computed(() =>
    allowedActions.value.has("edit-contacts"),
  );
  const canCancelBooking = computed(() => allowedActions.value.has("cancel"));
  const hasManagementActions = computed(
    () =>
      canEditDates.value ||
      canEditRoom.value ||
      canEditPackages.value ||
      canEditContacts.value,
  );

  return {
    allowedActions,
    canEditDates,
    canEditRoom,
    canEditPackages,
    canEditContacts,
    canCancelBooking,
    hasManagementActions,
  };
};
