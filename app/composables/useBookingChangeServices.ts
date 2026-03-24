import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import type { PackageResource } from "~/types/room";

type ChangeServicesResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

export const useBookingChangeServices = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking } = storeToRefs(bookingStore);

  const isChangeServicesPopupOpen = ref(false);
  const isLoadingPackages = ref(false);
  const isChangingServices = ref(false);
  const changeServicesError = ref<string | null>(null);
  const changeServicesSuccess = ref<string | null>(null);
  const availablePackages = ref<PackageResource[]>([]);
  const selectedPackageCodes = ref<string[]>([]);

  /** Коды room_type/rate_plan из первой комнаты текущего бронирования */
  const bookingRoomCodes = computed<{
    roomTypeCode: string | null;
    ratePlanCode: string | null;
  }>(() => {
    const rooms = createdBooking.value?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0)
      return { roomTypeCode: null, ratePlanCode: null };
    const first = rooms[0] as Record<string, unknown>;
    return {
      roomTypeCode: pickString(first.room_type_code) ?? null,
      ratePlanCode:
        pickString(first.rate_plan_code) ??
        pickString(first.rate_type_code) ??
        null,
    };
  });

  /**
   * Инициализация состояния стора для корректной работы searchPackages:
   * выставляем даты, тип номера, тариф и гостей из данных бронирования.
   */
  function prepareStoreForSearch(
    roomTypeCode: string,
    ratePlanCode: string,
  ): void {
    const order = createdBooking.value?.order;
    const startAtRaw =
      typeof order?.start_at === "string" ? order.start_at : "";
    const endAtRaw = typeof order?.end_at === "string" ? order.end_at : "";

    if (startAtRaw && endAtRaw) {
      bookingStore.setDate([new Date(startAtRaw), new Date(endAtRaw)]);
    }

    bookingStore.setSelectedRoomType(roomTypeCode);
    bookingStore.setSelectedTariff({
      rate_plan_code: ratePlanCode,
      title: "",
      price: 0,
      packages: [],
    });

    const roomsRaw = Array.isArray(createdBooking.value?.rooms)
      ? createdBooking.value.rooms
      : [];
    if (roomsRaw.length > 0) {
      bookingStore.setGuests({
        rooms: roomsRaw.length,
        roomList: roomsRaw.map((roomRaw) => {
          const r = roomRaw as Record<string, unknown>;
          return {
            adults: Math.max(pickNumber(r.adults) ?? 1, 1),
            children: pickNumber(r.children) ?? 0,
            childrenAges: (Array.isArray(r.children_ages)
              ? r.children_ages
              : []
            )
              .map((age) => pickNumber(age))
              .filter((age): age is number => age !== null),
          };
        }),
      });
    }
  }

  const openChangeServicesPopup = async () => {
    changeServicesError.value = null;
    changeServicesSuccess.value = null;
    availablePackages.value = [];
    isChangeServicesPopupOpen.value = true;

    const { roomTypeCode, ratePlanCode } = bookingRoomCodes.value;
    if (!roomTypeCode || !ratePlanCode) {
      changeServicesError.value =
        "Не удалось определить номер для загрузки услуг.";
      return;
    }

    // Инициализируем пакеты из текущего бронирования (первая комната)
    const firstRoomRaw = Array.isArray(createdBooking.value?.rooms)
      ? (createdBooking.value.rooms[0] as Record<string, unknown>)
      : null;
    const currentPackages =
      firstRoomRaw && Array.isArray(firstRoomRaw.packages)
        ? (firstRoomRaw.packages as unknown[])
            .map((p) => pickString(p))
            .filter((p): p is string => p !== null)
        : [];
    selectedPackageCodes.value = [...currentPackages];

    prepareStoreForSearch(roomTypeCode, ratePlanCode);

    isLoadingPackages.value = true;
    try {
      const packages = await bookingStore.searchPackages(0);
      availablePackages.value = packages ?? [];
    } catch {
      changeServicesError.value =
        "Не удалось загрузить список доступных услуг.";
      availablePackages.value = [];
    } finally {
      isLoadingPackages.value = false;
    }
  };

  const closeChangeServicesPopup = () => {
    changeServicesError.value = null;
    changeServicesSuccess.value = null;
    isChangeServicesPopupOpen.value = false;
    availablePackages.value = [];
    selectedPackageCodes.value = [];
  };

  const togglePackage = (code: string) => {
    const idx = selectedPackageCodes.value.indexOf(code);
    if (idx === -1) {
      selectedPackageCodes.value = [...selectedPackageCodes.value, code];
    } else {
      selectedPackageCodes.value = selectedPackageCodes.value.filter(
        (c) => c !== code,
      );
    }
  };

  const confirmChangeServices = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeServicesError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    isChangingServices.value = true;
    changeServicesError.value = null;
    changeServicesSuccess.value = null;

    try {
      const order = createdBooking.value?.order;
      const startAtRaw =
        typeof order?.start_at === "string" ? order.start_at : "";
      const endAtRaw = typeof order?.end_at === "string" ? order.end_at : "";
      const startAt = startAtRaw.slice(0, 10);
      const endAt = endAtRaw.slice(0, 10);
      if (!startAt || !endAt) {
        throw new Error("Не удалось определить даты текущего бронирования.");
      }

      const roomsRaw = Array.isArray(createdBooking.value?.rooms)
        ? createdBooking.value.rooms
        : [];
      if (roomsRaw.length === 0) {
        throw new Error(
          "Не удалось определить состав бронирования. Обновите страницу.",
        );
      }

      const rooms = roomsRaw.map((roomRaw, roomIndex) => {
        const room = roomRaw as Record<string, unknown>;

        const childrenAges = (
          Array.isArray(room.children_ages) ? room.children_ages : []
        )
          .map((age) => pickNumber(age))
          .filter((age): age is number => age !== null);

        const existingPackages = (
          Array.isArray(room.packages) ? room.packages : []
        )
          .map((pkg) => pickString(pkg))
          .filter((pkg): pkg is string => pkg !== null);

        // Для первой комнаты подставляем выбранные пакеты, остальные — без изменений
        const packages =
          roomIndex === 0 ? [...selectedPackageCodes.value] : existingPackages;

        const guestsRaw = Array.isArray(room.guests) ? room.guests : [];
        const guests = guestsRaw.map((guestRaw) => {
          const guest = guestRaw as Record<string, unknown>;
          return {
            id: pickNumber(guest.id),
            surname: pickString(guest.surname) ?? "",
            name: pickString(guest.name) ?? "",
            middle_name: pickString(guest.middle_name),
            phone: pickString(guest.phone) ?? "",
            email: pickString(guest.email) ?? "",
          };
        });

        return {
          booking_id: pickNumber(room.id),
          room_type_code: pickString(room.room_type_code) ?? "",
          rate_plan_code:
            pickString(room.rate_plan_code) ??
            pickString(room.rate_type_code) ??
            "",
          adults: pickNumber(room.adults) ?? 1,
          children: pickNumber(room.children) ?? 0,
          children_ages: childrenAges,
          packages,
          guests,
        };
      });

      const response = (await put<unknown>(
        `/v1/booking/${uuid}`,
        { start_at: startAt, end_at: endAt, rooms },
        { signal: AbortSignal.timeout(15000) },
      )) as ChangeServicesResponse;

      if (!response.success) {
        throw new Error(response.message || "Не удалось изменить услуги");
      }

      await bookingStore.getBookingByUuid(uuid);
      changeServicesSuccess.value = "Услуги успешно обновлены.";
    } catch (error: unknown) {
      changeServicesError.value = getErrorMessage(error);
    } finally {
      isChangingServices.value = false;
    }
  };

  return {
    isChangeServicesPopupOpen,
    isLoadingPackages,
    isChangingServices,
    changeServicesError,
    changeServicesSuccess,
    availablePackages,
    selectedPackageCodes,
    openChangeServicesPopup,
    closeChangeServicesPopup,
    togglePackage,
    confirmChangeServices,
  };
};
