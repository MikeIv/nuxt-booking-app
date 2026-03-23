import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";

type ChangeBookingDatesResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

type BookingChangeGuest = {
  surname: string;
  name: string;
  middle_name: string | null;
  phone: string;
  email: string;
  nationality: string;
  sms_confirmation: boolean;
  email_subscribe: boolean;
};

type BookingChangeRoom = {
  room_type_code: string;
  rate_type_code: string;
  rate_plan_code: string;
  packages: string[];
  adults: number;
  children: number;
  children_ages: number[];
  guests: BookingChangeGuest[];
};

export const useBookingChangeDates = (
  currentBookingUuid: ComputedRef<string | null>,
  bookingDate: ComputedRef<[Date, Date] | null>,
) => {
  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    date,
    createdBooking,
  } = storeToRefs(bookingStore);

  const isChangeDatesPopupOpen = ref(false);
  const isChangingDates = ref(false);
  const changeDatesError = ref<string | null>(null);
  const changeDatesSuccess = ref<string | null>(null);
  const newDates = ref<[Date, Date] | null>(null);
  const isChangeDatesCalendarOpen = ref(false);

  const selectedPackages = computed<string[]>(() => {
    const list = bookingStore.getSelectedServicesForRoom(0) ?? [];
    return list
      .map((s) => s.packageCode)
      .filter(
        (code): code is string =>
          typeof code === "string" && code.trim() !== "",
      );
  });

  const bookingRoomCodes = computed<{
    roomTypeCode: string | null;
    ratePlanCode: string | null;
  }>(() => {
    const rooms = createdBooking.value?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0)
      return { roomTypeCode: null, ratePlanCode: null };

    const first = rooms[0] as Record<string, unknown> | null | undefined;
    if (!first || typeof first !== "object")
      return { roomTypeCode: null, ratePlanCode: null };

    const roomTypeCode =
      pickString(first.room_type_code) ??
      pickString(first.roomTypeCode) ??
      pickString(first.roomType) ??
      null;

    const ratePlanCode =
      pickString(first.rate_plan_code) ??
      pickString(first.ratePlanCode) ??
      pickString(first.rate_type_code) ??
      pickString(first.rateTypeCode) ??
      null;

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

  function buildProfileFallback() {
    const order = createdBooking.value?.order;
    const firstRoom = Array.isArray(createdBooking.value?.rooms)
      ? (createdBooking.value.rooms[0] as Record<string, unknown> | undefined)
      : undefined;
    const guests = Array.isArray(firstRoom?.guests)
      ? (firstRoom.guests as Array<Record<string, unknown>>)
      : [];
    const mainGuest =
      guests.find((g) => g.is_main === true) ?? guests[0] ?? null;

    return {
      name:
        (typeof order?.name === "string" ? order.name : "") ||
        (typeof mainGuest?.name === "string" ? mainGuest.name : "") ||
        authStore.user?.name ||
        "",
      surname:
        (typeof order?.surname === "string" ? order.surname : "") ||
        (typeof mainGuest?.surname === "string" ? mainGuest.surname : "") ||
        authStore.user?.surname ||
        "",
      middle_name:
        (typeof mainGuest?.middle_name === "string"
          ? mainGuest.middle_name
          : "") ||
        authStore.user?.middle_name ||
        "",
      phone:
        (typeof mainGuest?.phone === "string" ? mainGuest.phone : "") ||
        authStore.user?.phone ||
        "",
      email:
        (typeof mainGuest?.email === "string" ? mainGuest.email : "") ||
        authStore.user?.email ||
        "",
      country:
        (typeof order?.nationality === "string" ? order.nationality : "") ||
        authStore.user?.country ||
        "",
    };
  }

  function buildBookingChangeRooms(
    roomTypeCode: string,
    ratePlanCode: string,
    chosenPackages: string[],
  ): BookingChangeRoom[] {
    const roomsRaw = createdBooking.value?.rooms;
    if (!Array.isArray(roomsRaw) || roomsRaw.length === 0) {
      return [
        {
          room_type_code: roomTypeCode,
          rate_type_code: ratePlanCode,
          rate_plan_code: ratePlanCode,
          packages: [...chosenPackages],
          adults: 1,
          children: 0,
          children_ages: [],
          guests: [],
        },
      ];
    }

    return roomsRaw.map((roomRaw, roomIndex) => {
      const room = roomRaw as Record<string, unknown>;

      const roomRateCode =
        pickString(room.rate_type_code) ??
        pickString(room.rate_plan_code) ??
        pickString(room.ratePlanCode) ??
        ratePlanCode;

      const roomType =
        pickString(room.room_type_code) ??
        pickString(room.roomTypeCode) ??
        roomTypeCode;

      const roomPackagesRaw = Array.isArray(room.packages) ? room.packages : [];
      const roomPackages = roomPackagesRaw
        .map((pkg) => pickString(pkg))
        .filter((pkg): pkg is string => pkg !== null);
      const packages =
        roomIndex === 0 && chosenPackages.length > 0
          ? [...chosenPackages]
          : roomPackages;

      const childrenAgesRaw = Array.isArray(room.children_ages)
        ? room.children_ages
        : [];
      const childrenAges = childrenAgesRaw
        .map((age) => pickNumber(age))
        .filter((age): age is number => age !== null);

      const guestsRaw = Array.isArray(room.guests) ? room.guests : [];
      const guests: BookingChangeGuest[] = guestsRaw.map((guestRaw) => {
        const guest = guestRaw as Record<string, unknown>;
        return {
          surname: pickString(guest.surname) ?? "",
          name: pickString(guest.name) ?? "",
          middle_name: pickString(guest.middle_name),
          phone: pickString(guest.phone) ?? "",
          email: pickString(guest.email) ?? "",
          nationality:
            pickString(guest.nationality) ??
            pickString(createdBooking.value?.order?.nationality) ??
            "",
          sms_confirmation: pickBoolean(guest.sms_confirmation),
          email_subscribe: pickBoolean(guest.email_subscribe),
        };
      });

      return {
        room_type_code: roomType,
        rate_type_code: roomRateCode,
        rate_plan_code: roomRateCode,
        packages,
        adults: pickNumber(room.adults) ?? 1,
        children: pickNumber(room.children) ?? 0,
        children_ages: childrenAges,
        guests,
      };
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
      date.value = [...newDates.value] as [Date, Date];

      const searchResults = await bookingStore.search({
        roomTypeCode,
        skipReset: true,
      });
      if (!searchResults.available) {
        changeDatesError.value =
          "На выбранные даты номер нельзя забронировать.";
        date.value = prevDate;
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
        date.value = prevDate;
        return;
      }

      selectedTariffStore.value = matchingTariff;

      let packagesOk = true;
      const chosenPackages = selectedPackages.value;
      if (chosenPackages.length) {
        const packages = await bookingStore.searchPackages(0);
        const availablePackageCodes = new Set(
          (packages ?? []).map((p) => p.package_code),
        );
        packagesOk = chosenPackages.every((code) =>
          availablePackageCodes.has(code),
        );
      }

      if (!packagesOk) {
        changeDatesError.value =
          "На выбранные даты выбранные дополнительные услуги недоступны. Попробуйте другие даты.";
        selectedTariffStore.value = prevSelectedTariff;
        date.value = prevDate;
        return;
      }

      const [startDate, endDate] = newDates.value;
      const profileFallback = buildProfileFallback();
      const bookingChangeRooms = buildBookingChangeRooms(
        roomTypeCode,
        ratePlanCode,
        chosenPackages,
      );
      const totalAdults = bookingChangeRooms.reduce(
        (sum, r) => sum + r.adults,
        0,
      );
      const totalChildren = bookingChangeRooms.reduce(
        (sum, r) => sum + r.children,
        0,
      );
      const allChildrenAges = bookingChangeRooms.flatMap(
        (r) => r.children_ages,
      );
      const bookingOrder = createdBooking.value?.order as
        | Record<string, unknown>
        | undefined;

      const body = {
        name: (authStore.user?.name ?? "").trim() || profileFallback.name,
        surname:
          (authStore.user?.surname ?? "").trim() || profileFallback.surname,
        middle_name:
          (authStore.user?.middle_name ?? "").trim() ||
          profileFallback.middle_name,
        email: (authStore.user?.email ?? "").trim() || profileFallback.email,
        phone: (authStore.user?.phone ?? "").trim() || profileFallback.phone,
        country:
          (authStore.user?.country ?? "").trim() || profileFallback.country,
        booking_change: {
          uuid,
          start_at: bookingStore.formatDate(startDate),
          end_at: bookingStore.formatDate(endDate),
          room_type_code: roomTypeCode,
          rate_plan_code: ratePlanCode,
          rate_type_code: ratePlanCode,
          adults: totalAdults,
          children: totalChildren,
          children_ages: allChildrenAges,
          payment:
            pickString(bookingOrder?.payment_method) ??
            pickString(createdBooking.value?.status) ??
            "",
          additional: {
            start_at: null,
            end_at: null,
            comment: pickString(bookingOrder?.comment),
          },
          packages: chosenPackages,
          rooms: bookingChangeRooms,
        },
      };

      const response = (await put<unknown>("/v1/users/profile", body, {
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
      selectedTariffStore.value = prevSelectedTariff;
      date.value = prevDate;
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
