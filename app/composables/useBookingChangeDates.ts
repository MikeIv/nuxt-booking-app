import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import { pickNumber, pickString } from "~/utils/pick";
import {
  buildBookingRoomRefs,
  pickChildrenAges,
  pickRoomPackageCodes,
  pickRoomRatePlanCode,
} from "~/utils/bookingChangeRequest";

type ChangeBookingDatesResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

export const useBookingChangeDates = (
  currentBookingUuid: ComputedRef<string | null>,
  bookingDate: ComputedRef<[Date, Date] | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    date,
    createdBooking,
  } = storeToRefs(bookingStore);

  const { setDate, setSelectedTariff, setGuests } = bookingStore;

  const isChangeDatesPopupOpen = ref(false);
  const isChangingDates = ref(false);
  const changeDatesError = ref<string | null>(null);
  const changeDatesSuccess = ref<string | null>(null);
  const newDates = ref<[Date, Date] | null>(null);
  const isChangeDatesCalendarOpen = ref(false);

  const createdBookingRooms = computed<Record<string, unknown>[]>(() => {
    const rooms = createdBooking.value?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0) return [];
    return rooms.map((room) => room as Record<string, unknown>);
  });

  const bookingRoomCodes = computed<{
    roomTypeCode: string | null;
    ratePlanCode: string | null;
  }>(() => {
    const first = createdBookingRooms.value[0];
    if (!first) return { roomTypeCode: null, ratePlanCode: null };

    const roomTypeCode =
      pickString(first.room_type_code) ??
      pickString(first.roomTypeCode) ??
      pickString(first.roomType) ??
      null;

    const ratePlanCode = pickRoomRatePlanCode(first) || null;

    return { roomTypeCode, ratePlanCode };
  });

  const effectiveRoomTypeCode = computed<string | null>(() => {
    return (
      pickString(selectedRoomType.value) ?? bookingRoomCodes.value.roomTypeCode
    );
  });

  const effectiveRatePlanCode = computed<string | null>(() => {
    return (
      pickString(selectedTariffStore.value?.rate_plan_code) ??
      bookingRoomCodes.value.ratePlanCode
    );
  });

  function syncGuestsFromCreatedBooking(): void {
    const rooms = createdBookingRooms.value;
    if (rooms.length === 0) return;

    setGuests({
      rooms: rooms.length,
      roomList: rooms.map((room) => ({
        adults: Math.max(pickNumber(room.adults) ?? 1, 1),
        children: pickNumber(room.children) ?? 0,
        childrenAges: pickChildrenAges(room),
      })),
    });
  }

  const canSubmitDateChange = computed(() => {
    if (isChangingDates.value) return false;
    if (!newDates.value || newDates.value.length !== 2) return false;
    const [start, end] = newDates.value;
    if (!(start instanceof Date) || !(end instanceof Date)) return false;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return false;
    return end > start;
  });

  const openChangeDatesPopup = () => {
    changeDatesError.value = null;
    changeDatesSuccess.value = null;
    newDates.value = bookingDate.value
      ? ([...bookingDate.value] as [Date, Date])
      : null;
    isChangeDatesPopupOpen.value = true;
  };

  const closeChangeDatesPopup = () => {
    changeDatesError.value = null;
    changeDatesSuccess.value = null;
    isChangeDatesPopupOpen.value = false;
    isChangeDatesCalendarOpen.value = false;
  };

  const confirmChangeDates = async () => {
    const uuid = currentBookingUuid.value;
    const roomTypeCode = effectiveRoomTypeCode.value;
    const ratePlanCode = effectiveRatePlanCode.value;

    if (!uuid) {
      changeDatesError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    if (!roomTypeCode || !ratePlanCode) {
      changeDatesError.value =
        "Не удалось определить выбранный номер/тариф для перепроверки доступности. Откройте бронь из личного кабинета или повторите бронирование.";
      return;
    }

    if (!canSubmitDateChange.value || !newDates.value) return;

    const prevDate = date.value ? ([...date.value] as [Date, Date]) : null;
    const prevSelectedTariff = selectedTariffStore.value;

    isChangingDates.value = true;
    changeDatesError.value = null;
    changeDatesSuccess.value = null;

    try {
      setDate([...newDates.value] as [Date, Date]);
      syncGuestsFromCreatedBooking();

      const searchResults = await bookingStore.search({
        roomTypeCode,
        skipReset: true,
      });
      if (!searchResults.available) {
        changeDatesError.value =
          "На выбранные даты номер нельзя забронировать.";
        setDate(prevDate);
        return;
      }

      const room = searchResults.rooms.find(
        (r) => r.room_type_code === roomTypeCode,
      );
      const matchingTariff =
        room?.tariffs?.find((t) => t.rate_plan_code === ratePlanCode) ?? null;
      if (!room || !matchingTariff) {
        changeDatesError.value =
          "На выбранные даты выбранный тариф недоступен.";
        setDate(prevDate);
        return;
      }

      setSelectedTariff(matchingTariff);

      const currentPackages = pickRoomPackageCodes(
        createdBookingRooms.value[0] ?? {},
      );

      if (currentPackages.length > 0) {
        const packages = await bookingStore.searchPackages(0);
        const availablePackageCodes = new Set(
          (packages ?? []).map((p) => p.package_code),
        );
        const packagesOk = currentPackages.every((code) =>
          availablePackageCodes.has(code),
        );

        if (!packagesOk) {
          changeDatesError.value =
            "На выбранные даты выбранные дополнительные услуги недоступны. Попробуйте другие даты.";
          setSelectedTariff(prevSelectedTariff);
          setDate(prevDate);
          return;
        }
      }

      const [startDate, endDate] = newDates.value;
      const body = {
        start_at: bookingStore.formatDate(startDate),
        end_at: bookingStore.formatDate(endDate),
        rooms: buildBookingRoomRefs(createdBookingRooms.value),
      };

      const response = (await put<unknown>(`/v1/booking/${uuid}`, body, {
        signal: AbortSignal.timeout(15000),
      })) as ChangeBookingDatesResponse;

      if (!response.success) {
        throw new Error(
          response.message || "Не удалось изменить даты бронирования",
        );
      }

      await bookingStore.getBookingByUuid(uuid);
      changeDatesSuccess.value = "Ваша дата изменена и подтверждена.";
    } catch (error: unknown) {
      changeDatesError.value = getErrorMessage(error);
      setSelectedTariff(prevSelectedTariff);
      setDate(prevDate);
    } finally {
      isChangingDates.value = false;
    }
  };

  return {
    isChangeDatesPopupOpen,
    isChangingDates,
    changeDatesError,
    changeDatesSuccess,
    newDates,
    isChangeDatesCalendarOpen,
    canSubmitDateChange,
    openChangeDatesPopup,
    closeChangeDatesPopup,
    confirmChangeDates,
  };
};
