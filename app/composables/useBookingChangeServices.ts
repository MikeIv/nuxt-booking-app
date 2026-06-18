import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import type { PackageResource } from "~/types/room";
import { pickNumber, pickString } from "~/utils/pick";
import {
  mapBookingUpdateRooms,
  pickChildrenAges,
  pickRoomPackageCodes,
  pickRoomRatePlanCode,
} from "~/utils/bookingChangeRequest";

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
      ratePlanCode: pickRoomRatePlanCode(first) || null,
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
            childrenAges: pickChildrenAges(r),
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
    selectedPackageCodes.value = firstRoomRaw
      ? pickRoomPackageCodes(firstRoomRaw)
      : [];

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
      const roomsRaw = Array.isArray(createdBooking.value?.rooms)
        ? createdBooking.value.rooms
        : [];
      if (roomsRaw.length === 0) {
        throw new Error(
          "Не удалось определить состав бронирования. Обновите страницу.",
        );
      }

      const rooms = mapBookingUpdateRooms(roomsRaw, () => ({
        packages: [...selectedPackageCodes.value],
      }));

      const response = (await put<unknown>(
        `/v1/booking/${uuid}`,
        { rooms },
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
