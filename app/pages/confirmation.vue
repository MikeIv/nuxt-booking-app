<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useAuthStore } from "~/stores/auth";
  import { storeToRefs } from "pinia";
  import { useNights } from "~/composables/useNights";
  import QRCode from "qrcode";
  import type { SelectedEntry } from "~/types/booking";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const route = useRoute();
  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
  const toast = useNotificationToast();
  const { getErrorMessage } = useApiHelpers();
  const { put } = useApi();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    roomTariffs,
    date,
    selectedServices,
    loading,
    isServerRequest,
    createdBooking,
    currentBookingUuid: currentBookingUuidStore,
  } = storeToRefs(bookingStore);

  const bookingDate = computed<[Date, Date] | null>(() => {
    if (createdBooking.value?.order?.start_at && createdBooking.value?.order?.end_at) {
      return [
        new Date(createdBooking.value.order.start_at),
        new Date(createdBooking.value.order.end_at),
      ];
    }
    return date.value;
  });

  const nights = useNights(bookingDate);

  const selectedRoom = computed(() => {
    if (!roomTariffs.value?.length || !selectedRoomType.value) return null;
    return (
      roomTariffs.value.find(
        (room) => room.room_type_code === selectedRoomType.value,
      ) || null
    );
  });

  const selectedTariff = computed(() => {
    if (selectedTariffStore.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  const isBookingCreated = computed(() => {
    return !!createdBooking.value;
  });

  const bookingNumber = computed(() => {
    const booking = createdBooking.value;
    if (!booking) return null;
    if (booking.confirmation_number) return booking.confirmation_number;
    if (booking.id !== undefined && booking.id !== null) return String(booking.id);
    return null;
  });

  const guestEmail = computed(() => {
    return createdBooking.value?.hotel?.email || "";
  });

  const pdfUrl = computed(() => {
    return createdBooking.value?.order?.pdf || null;
  });

  type BookingAllowedAction =
    | "edit-dates"
    | "edit-number"
    | "edit-packages"
    | "edit-contacts"
    | "cancel";

  const allowedActions = computed<Set<BookingAllowedAction>>(() => {
    const allowed = createdBooking.value?.allowed;
    if (!Array.isArray(allowed)) return new Set<BookingAllowedAction>();
    return new Set(
      allowed.filter(
        (action): action is BookingAllowedAction =>
          action === "edit-dates" ||
          action === "edit-number" ||
          action === "edit-packages" ||
          action === "edit-contacts" ||
          action === "cancel",
      ),
    );
  });

  const canEditDates = computed(() => allowedActions.value.has("edit-dates"));
  const canEditRoom = computed(() => allowedActions.value.has("edit-number"));
  const canEditPackages = computed(() => allowedActions.value.has("edit-packages"));
  const canEditContacts = computed(() => allowedActions.value.has("edit-contacts"));
  const canCancelBooking = computed(() => allowedActions.value.has("cancel"));
  const hasManagementActions = computed(() => {
    return canEditDates.value || canEditRoom.value || canEditPackages.value || canEditContacts.value;
  });

  interface BookingRoom {
    id: number;
    title: string;
    tariff: {
      title: string;
      price: string | number;
    };
    guests: Array<{
      surname: string;
      name: string;
      middle_name: string | null;
      phone: string;
      email: string;
      is_main: boolean;
    }>;
    adults: number;
    children: number;
    total_guests: number;
    services: unknown[];
    total: number;
  }

  const qrCanvas = ref<HTMLCanvasElement | null>(null);

  // Функция генерации QR-кода
  const generateQRCode = async () => {
    if (!qrCanvas.value || !pdfUrl.value) {
      return;
    }

    try {
      await QRCode.toCanvas(qrCanvas.value, pdfUrl.value, {
        width: 140,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Ошибка при генерации QR-кода:", error);
    }
  };

  // Генерируем QR-код при изменении pdfUrl
  watch(pdfUrl, () => {
    if (pdfUrl.value) {
      nextTick(() => {
        generateQRCode();
      });
    }
  }, { immediate: true });

  // Преобразуем данные из API ответа в формат SelectedEntry
  const selectedByRoomIdx = computed<Record<string, SelectedEntry>>(() => {
    // Если бронирование создано, используем данные из API
    if (createdBooking.value?.rooms && Array.isArray(createdBooking.value.rooms)) {
      const rooms = createdBooking.value.rooms as BookingRoom[];
      const entries: Record<string, SelectedEntry> = {};
      
      rooms.forEach((room, index) => {
        // Используем room.total (общая стоимость за номер) и делим на количество ночей
        // для получения цены за ночь
        const pricePerNight = nights.value > 0 
          ? room.total / nights.value 
          : room.total;
        
        entries[index.toString()] = {
          roomIdx: index,
          roomCardIdx: index,
          roomTitle: room.title || "",
          room_type_code: "", // Не доступно в API ответе
          ratePlanCode: "", // Не доступно в API ответе
          price: pricePerNight,
          title: room.tariff.title || "",
        };
      });
      
      return entries;
    }
    
    // Fallback: используем данные из store (для одного номера)
    if (!selectedRoom.value || !selectedTariff.value) {
      return {} as Record<string, SelectedEntry>;
    }
    
    return {
      "0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: selectedRoom.value.title || "",
        room_type_code: selectedRoom.value.room_type_code,
        ratePlanCode: selectedTariff.value.rate_plan_code,
        price: selectedTariff.value.price,
        title: selectedTariff.value.title || "",
      },
    };
  });

  const bookingTotal = computed(() => {
    // Если бронирование создано, используем total_price из API
    if (createdBooking.value && 'total_price' in createdBooking.value) {
      const totalPrice = createdBooking.value.total_price as number;
      return totalPrice || 0;
    }
    
    // Fallback: считаем из store
    const tariffPrice = selectedTariff.value?.price;
    if (!tariffPrice || nights.value === 0) return 0;
    
    const roomTotal = tariffPrice * nights.value;
    const servicesTotal = selectedServices.value.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );
    
    return roomTotal + servicesTotal;
  });

  // Обновляем данные о гостях из созданного бронирования
  watch(
    () => createdBooking.value,
    (booking) => {
      if (booking?.rooms && Array.isArray(booking.rooms)) {
        const rooms = booking.rooms as BookingRoom[];
        const roomList = rooms.map((room) => ({
          adults: room.adults || 0,
          children: room.children || 0,
          childrenAges: [] as number[],
        }));
        
        bookingStore.guests = {
          rooms: roomList.length,
          roomList,
        };
      }
    },
    { immediate: true },
  );

  // Устанавливаем флаг в sessionStorage при создании бронирования
  watch(
    () => isBookingCreated.value,
    (isCreated) => {
      if (
        isCreated &&
        !authStore.isAuthenticated &&
        typeof window !== "undefined"
      ) {
        sessionStorage.setItem("hasUnauthenticatedBooking", "true");
      }
    },
    { immediate: true },
  );

  onMounted(async () => {
    if (loading.value && isServerRequest.value) {
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }

    const queryUuid = route.query.uuid;
    const effectiveBookingUuid =
      typeof queryUuid === "string" && queryUuid.trim() !== ""
        ? queryUuid
        : currentBookingUuid.value;

    if (effectiveBookingUuid) {
      try {
        const cachedBooking = bookingStore.getSessionBookingByUuid(effectiveBookingUuid);
        if (cachedBooking) {
          bookingStore.setBookingByUuid(cachedBooking);
        } else {
          await bookingStore.getBookingByUuid(effectiveBookingUuid);
        }
      } catch {
        toast.add({
          severity: "error",
          summary: "Не удалось загрузить данные бронирования",
          detail: bookingStore.error ?? "Проверьте ссылку или попробуйте позже.",
          life: 5000,
        });
      }
    }

    // Если бронирование успешно создано и пользователь неавторизован,
    // сохраняем флаг в sessionStorage для отображения кнопки "Моё бронирование"
    if (
      isBookingCreated.value &&
      !authStore.isAuthenticated &&
      typeof window !== "undefined"
    ) {
      sessionStorage.setItem("hasUnauthenticatedBooking", "true");
    }
  });

  const handleDownload = async () => {
    const url = pdfUrl.value;
    if (!url) {
      toast.add({
        severity: "warn",
        summary: "PDF недоступен",
        detail: "Ссылка на подтверждение бронирования отсутствует.",
        life: 4000,
      });
      return;
    }

    try {
      // Используем fetch для получения файла как blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки PDF: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `booking-confirmation-${bookingNumber.value || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Ошибка при скачивании PDF:", error);
      // Если fetch не работает (например, из-за CORS), пробуем открыть ссылку напрямую
      window.open(url, "_blank");
    }
  };

  const handlePrint = () => {
    const url = pdfUrl.value;
    if (!url) {
      toast.add({
        severity: "warn",
        summary: "PDF недоступен",
        detail: "Ссылка на подтверждение бронирования отсутствует.",
        life: 4000,
      });
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      const printWindow = window.open(url, "_blank");

      if (!printWindow) {
        toast.add({
          severity: "warn",
          summary: "Окно печати",
          detail: "Не удалось открыть окно печати. Проверьте настройки браузера.",
          life: 4000,
        });
        return;
      }

      if (typeof printWindow.print === "function") {
        printWindow.print();
      }
    } catch (error) {
      console.error("Ошибка при печати PDF:", error);
      window.open(url, "_blank");
    }
  };

  const handleChangeDates = () => {
    // Открываем попап смены дат (не уводим пользователя со страницы)
    openChangeDatesPopup();
  };

  const handleChangeRoom = () => {
    router.push("/rooms");
  };

  const handleChangeServices = () => {
    router.push("/services");
  };

  const handleChangeContacts = () => {
    openChangeContactsPopup();
  };

  const isCancelBookingPopupOpen = ref(false);
  const isCancellingBooking = ref(false);
  const cancelBookingError = ref<string | null>(null);

  const currentBookingUuid = computed<string | null>(() => {
    if (currentBookingUuidStore.value && currentBookingUuidStore.value.trim() !== "") {
      return currentBookingUuidStore.value;
    }
    const fromStore = createdBooking.value?.uuid;
    if (fromStore && String(fromStore).trim() !== "") return String(fromStore);
    const fromQuery = route.query.uuid;
    if (typeof fromQuery === "string" && fromQuery.trim() !== "") return fromQuery;
    return null;
  });

  type ContactFormData = {
    name: string;
    surname: string;
    middle_name: string;
    phone: string;
    email: string;
    country: string;
  };

  const isChangeContactsPopupOpen = ref(false);
  const isChangingContacts = ref(false);
  const changeContactsError = ref<string | null>(null);
  const changeContactsSuccess = ref<string | null>(null);
  const contactForm = ref<ContactFormData>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  function buildContactFormFromBooking(): ContactFormData {
    const order = createdBooking.value?.order;
    const firstRoom = Array.isArray(createdBooking.value?.rooms)
      ? (createdBooking.value.rooms[0] as Record<string, unknown> | undefined)
      : undefined;
    const guests = Array.isArray(firstRoom?.guests)
      ? (firstRoom.guests as Array<Record<string, unknown>>)
      : [];
    const mainGuest = guests.find((guest) => guest.is_main === true) ?? guests[0] ?? null;

    const fromOrderName = typeof order?.name === "string" ? order.name : "";
    const fromOrderSurname = typeof order?.surname === "string" ? order.surname : "";
    const fromOrderCountry = typeof order?.nationality === "string" ? order.nationality : "";

    const fromGuestName = typeof mainGuest?.name === "string" ? mainGuest.name : "";
    const fromGuestSurname = typeof mainGuest?.surname === "string" ? mainGuest.surname : "";
    const fromGuestMiddleName =
      typeof mainGuest?.middle_name === "string" ? mainGuest.middle_name : "";
    const fromGuestPhone = typeof mainGuest?.phone === "string" ? mainGuest.phone : "";
    const fromGuestEmail = typeof mainGuest?.email === "string" ? mainGuest.email : "";

    return {
      name: fromOrderName || fromGuestName || authStore.user?.name || "",
      surname: fromOrderSurname || fromGuestSurname || authStore.user?.surname || "",
      middle_name: fromGuestMiddleName || authStore.user?.middle_name || "",
      phone: fromGuestPhone || authStore.user?.phone || "",
      email: fromGuestEmail || authStore.user?.email || "",
      country: fromOrderCountry || authStore.user?.country || "",
    };
  }

  const canSubmitContactChange = computed(() => {
    if (isChangingContacts.value) return false;
    if (!contactForm.value.name.trim()) return false;
    if (!contactForm.value.surname.trim()) return false;
    if (!contactForm.value.phone.trim()) return false;
    if (!contactForm.value.email.trim()) return false;
    if (!contactForm.value.country.trim()) return false;

    const emailPattern = /^\S+@\S+\.\S+$/;
    const phonePattern = /^[+]?[0-9\s\-()]{10,}$/;
    if (!emailPattern.test(contactForm.value.email.trim())) return false;
    if (!phonePattern.test(contactForm.value.phone.trim())) return false;
    return true;
  });

  function openChangeContactsPopup() {
    changeContactsError.value = null;
    changeContactsSuccess.value = null;
    contactForm.value = buildContactFormFromBooking();
    isChangeContactsPopupOpen.value = true;
  }

  function closeChangeContactsPopup() {
    changeContactsError.value = null;
    changeContactsSuccess.value = null;
    isChangeContactsPopupOpen.value = false;
  }

  const confirmChangeContacts = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeContactsError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    if (!canSubmitContactChange.value) {
      changeContactsError.value = "Проверьте корректность заполнения полей.";
      return;
    }

    isChangingContacts.value = true;
    changeContactsError.value = null;
    changeContactsSuccess.value = null;

    try {
      const body = {
        name: contactForm.value.name.trim(),
        surname: contactForm.value.surname.trim(),
        middle_name: contactForm.value.middle_name.trim(),
        email: contactForm.value.email.trim(),
        phone: contactForm.value.phone.trim(),
        country: contactForm.value.country.trim(),
        booking_change: {
          uuid,
          contacts: {
            name: contactForm.value.name.trim(),
            surname: contactForm.value.surname.trim(),
            middle_name: contactForm.value.middle_name.trim(),
            email: contactForm.value.email.trim(),
            phone: contactForm.value.phone.trim(),
            country: contactForm.value.country.trim(),
          },
        },
      };

      const response = (await put<unknown>("/v1/users/profile", body, {
        signal: AbortSignal.timeout(15000),
      })) as ChangeBookingDatesResponse;

      if (!response.success) {
        throw new Error(response.message || "Не удалось изменить контактные данные");
      }

      await bookingStore.getBookingByUuid(uuid);
      changeContactsSuccess.value = "Контактные данные успешно обновлены.";
    } catch (error: unknown) {
      changeContactsError.value = getErrorMessage(error);
    } finally {
      isChangingContacts.value = false;
    }
  };

  function openCancelBookingPopup() {
    cancelBookingError.value = null;
    isCancelBookingPopupOpen.value = true;
  }

  function closeCancelBookingPopup() {
    cancelBookingError.value = null;
    isCancelBookingPopupOpen.value = false;
  }

  const confirmCancelBooking = async () => {
    const uuid = currentBookingUuid.value;

    if (!uuid) {
      toast.add({
        severity: "error",
        summary: "Не удалось отменить бронирование",
        detail: "UUID бронирования не найден. Обновите страницу или проверьте ссылку.",
        life: 5000,
      });
      closeCancelBookingPopup();
      return;
    }

    if (isCancellingBooking.value) return;

    isCancellingBooking.value = true;
    try {
      const { post } = useApi();

      const response = await post<unknown>(`/v1/booking/${uuid}/cancel`, { uuid }, {
        signal: AbortSignal.timeout(15000),
      });

      if (response.success) {
        cancelBookingError.value = null;
        closeCancelBookingPopup();
        bookingStore.forceReset();

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }

        await router.push("/");
        return;
      }

      cancelBookingError.value = response.message ?? "Не удалось отменить бронирование.";
    } catch (error: unknown) {
      cancelBookingError.value = getErrorMessage(error);
      toast.add({
        severity: "error",
        summary: "Не удалось отменить бронирование",
        detail: getErrorMessage(error),
        life: 5000,
      });
    } finally {
      isCancellingBooking.value = false;
    }
  };

  const handleNewBooking = () => {
    bookingStore.forceReset();
    router.push("/");
  };

  // --- Изменение дат бронирования ---
  type ChangeBookingDatesResponse = {
    success: boolean;
    message?: string;
    payload?: unknown;
  };

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
      .filter((code): code is string => typeof code === "string" && code.trim() !== "");
  });

  function pickString(value: unknown): string | null {
    return typeof value === "string" && value.trim() !== "" ? value : null;
  }

  const bookingRoomCodes = computed<{ roomTypeCode: string | null; ratePlanCode: string | null }>(() => {
    const rooms = createdBooking.value?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return { roomTypeCode: null, ratePlanCode: null };
    }

    const first = rooms[0] as Record<string, unknown> | null | undefined;
    if (!first || typeof first !== "object") {
      return { roomTypeCode: null, ratePlanCode: null };
    }

    // Поддерживаем разные варианты нейминга, если бэкенд их возвращает
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
    return pickString(selectedRoomType.value) ?? bookingRoomCodes.value.roomTypeCode;
  });

  const effectiveRatePlanCode = computed<string | null>(() => {
    return (
      pickString(selectedTariff.value?.rate_plan_code) ??
      bookingRoomCodes.value.ratePlanCode
    );
  });

  function openChangeDatesPopup() {
    changeDatesError.value = null;
    changeDatesSuccess.value = null;
    // Проставляем текущие даты брони как дефолт
    newDates.value = bookingDate.value ? ([...bookingDate.value] as [Date, Date]) : null;
    isChangeDatesPopupOpen.value = true;
  }

  function closeChangeDatesPopup() {
    changeDatesError.value = null;
    changeDatesSuccess.value = null;
    isChangeDatesPopupOpen.value = false;
  }

  const canSubmitDateChange = computed(() => {
    if (isChangingDates.value) return false;
    if (!newDates.value || newDates.value.length !== 2) return false;
    const [start, end] = newDates.value;
    if (!(start instanceof Date) || !(end instanceof Date)) return false;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    // Минимально: диапазон должен быть корректным
    if (end <= start) return false;
    return true;
  });

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
      // 1) Временно переключаем даты в store, чтобы переиспользовать существующую логику /v1/search
      date.value = ([...newDates.value] as [Date, Date]);

      const searchResults = await bookingStore.search({
        roomTypeCode,
        skipReset: true,
      });

      if (!searchResults.available) {
        changeDatesError.value = "На выбранные даты номер нельзя забронировать.";
        // rollback
        date.value = prevDate;
        return;
      }

      // Проверяем, что нужный тариф присутствует на новых датах
      const room = searchResults.rooms.find((r) => r.room_type_code === roomTypeCode);
      const matchingTariff = room?.tariffs?.find((t) => t.rate_plan_code === ratePlanCode) ?? null;
      if (!room || !matchingTariff) {
        changeDatesError.value = "На выбранные даты выбранный тариф недоступен.";
        date.value = prevDate;
        return;
      }

      // 2) Перепроверяем доступность выбранных пакетов/услуг для нового диапазона
      selectedTariffStore.value = matchingTariff;
      let packagesOk = true;
      const chosenPackages = selectedPackages.value;
      if (chosenPackages.length) {
        const packages = await bookingStore.searchPackages(0);
        const availablePackageCodes = new Set((packages ?? []).map((p) => p.package_code));
        packagesOk = chosenPackages.every((code) => availablePackageCodes.has(code));
      }

      if (!packagesOk) {
        changeDatesError.value =
          "На выбранные даты выбранные дополнительные услуги недоступны. Попробуйте другие даты.";
        // rollback
        selectedTariffStore.value = prevSelectedTariff;
        date.value = prevDate;
        return;
      }

      // 3) Отправляем запрос изменения (backend: PUT /v1/users/profile)
      const [startDate, endDate] = newDates.value;
      const body = {
        // сохраняем совместимость с текущим контрактом профиля
        name: authStore.user?.name ?? "",
        surname: authStore.user?.surname ?? "",
        middle_name: authStore.user?.middle_name ?? "",
        email: authStore.user?.email ?? "",
        phone: authStore.user?.phone ?? "",
        country: authStore.user?.country ?? "",
        // расширение для механизма изменения брони
        booking_change: {
          uuid,
          start_at: bookingStore.formatDate(startDate),
          end_at: bookingStore.formatDate(endDate),
          room_type_code: roomTypeCode,
          rate_plan_code: ratePlanCode,
          packages: chosenPackages,
        },
      };

      const response = (await put<unknown>("/v1/users/profile", body, {
        signal: AbortSignal.timeout(15000),
      })) as ChangeBookingDatesResponse;

      if (!response.success) {
        throw new Error(response.message || "Не удалось изменить даты бронирования");
      }

      // 4) Обновляем отображение: перегружаем бронь по uuid (если доступно)
      await bookingStore.getBookingByUuid(uuid);

      changeDatesSuccess.value = "Ваша дата изменена и подтверждена.";
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      changeDatesError.value = msg;
      // rollback best-effort
      selectedTariffStore.value = prevSelectedTariff;
      date.value = prevDate;
    } finally {
      isChangingDates.value = false;
    }
  };
</script>

<template>
  <main :class="$style.container">
    <h1 :class="$style.header" data-breadcrumb="Ваше бронирование">Ваше бронирование подтверждено!</h1>
    <section :class="$style.contentBlock">
      <div :class="$style.contentWrapper">
        <div :class="$style.mainContent">
          <div :class="$style.section">
              <h2 :class="$style.sectionTitle">Номер Вашего бронирования:</h2>
              <div :class="$style.bookingInfo">
                <div :class="$style.bookingLeft">
                  <div v-if="isBookingCreated && bookingNumber" :class="$style.bookingNumber">
                    № {{ bookingNumber }}
                  </div>
                  <div v-else :class="$style.bookingMessage">
                    Обновите бронирование
                  </div>
                  <div v-if="isBookingCreated" :class="$style.actionButtons">
                    <Button
                      v-if="pdfUrl"
                      label="Скачать подтверждение"
                      class="btn__bs danger"
                      unstyled
                      @click="handleDownload"
                    />
                    <Button
                      label="Распечатать"
                      class="btn__bs dark"
                      unstyled
                      @click="handlePrint"
                    />
                  </div>
                </div>
                <div v-if="isBookingCreated && pdfUrl" :class="$style.qrCode">
                  <canvas ref="qrCanvas" :class="$style.qrCanvas" />
                </div>
              </div>
            </div>

            <div :class="$style.divider" />

            <div :class="$style.section">
              <p :class="$style.confirmationText">
                Подтверждение о бронировании отправлено на указанную Вами
                электронную почту {{ guestEmail }}
              </p>
            </div>

            <div :class="$style.divider" />

            <BookingConfirmationManagement
              :has-management-actions="hasManagementActions"
              :can-edit-dates="canEditDates"
              :can-edit-room="canEditRoom"
              :can-edit-packages="canEditPackages"
              :can-edit-contacts="canEditContacts"
              @change-dates="handleChangeDates"
              @change-room="handleChangeRoom"
              @change-services="handleChangeServices"
              @change-contacts="handleChangeContacts"
            />

            <div v-if="hasManagementActions" :class="$style.divider" />

            <div :class="$style.section">
              <div :class="$style.finalButtons">
                <div :class="$style.cancelButtonWrapper">
                  <Button
                    v-if="canCancelBooking"
                    label="Отменить бронирование"
                    class="btn__bs danger"
                    unstyled
                    :disabled="isCancellingBooking"
                    @click="openCancelBookingPopup"
                  />
                </div>
                <Button
                  label="Новое бронирование"
                  class="btn__bs danger"
                  unstyled
                  @click="handleNewBooking"
                />
              </div>
            </div>
        </div>
        <div :class="$style.summaryWrapper">
          <BookingSummary
            :selected-entries="selectedByRoomIdx"
            :date="bookingDate"
            :nights="nights"
            :booking-total="bookingTotal"
            :show-continue="false"
          />
        </div>
      </div>
    </section>

    <BookingConfirmationCancelPopup
      :is-open="isCancelBookingPopupOpen"
      :is-cancelling-booking="isCancellingBooking"
      :cancel-booking-error="cancelBookingError"
      @close="closeCancelBookingPopup"
      @confirm="confirmCancelBooking"
    />

    <BookingConfirmationChangeDatesPopup
      v-model="newDates"
      :is-open="isChangeDatesPopupOpen"
      :is-calendar-open="isChangeDatesCalendarOpen"
      :can-submit-date-change="canSubmitDateChange"
      :is-changing-dates="isChangingDates"
      :change-dates-success="changeDatesSuccess"
      :change-dates-error="changeDatesError"
      @close="closeChangeDatesPopup"
      @confirm="confirmChangeDates"
      @update:is-calendar-open="isChangeDatesCalendarOpen = $event"
    />
    <BookingConfirmationChangeContactsPopup
      :is-open="isChangeContactsPopupOpen"
      :form="contactForm"
      :can-submit-contact-change="canSubmitContactChange"
      :is-changing-contacts="isChangingContacts"
      :change-contacts-success="changeContactsSuccess"
      :change-contacts-error="changeContactsError"
      @close="closeChangeContactsPopup"
      @confirm="confirmChangeContacts"
      @update:form="contactForm = $event"
    />
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: rem(24) rem(16);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    line-height: 1.3;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(30);
      margin: rem(32) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
      margin: rem(40) 0;
    }
  }

  .contentBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(16) rem(16);

    @media (min-width: #{size.$tablet}) {
      padding: rem(16) rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(20) rem(32);
    }

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .contentWrapper {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    @media (min-width: #{size.$desktopMin}) {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: rem(40);
      align-items: stretch;
    }
  }

  .mainContent {
    display: flex;
    flex-direction: column;
  }

  .summaryWrapper {
    display: flex;
    width: 100%;
    @media (min-width: #{size.$desktopMin}) {
      flex-direction: column;
      width: 100%;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(24) 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(20);
      padding: rem(28) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(24);
      padding: rem(32) 0;
    }

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
    }
  }

  .sectionTitle {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(22);
    }
  }

  .bookingInfo {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    @media (min-width: #{size.$tablet}) {
      gap: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: rem(32);
    }
  }

  .bookingLeft {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    @media (min-width: #{size.$tablet}) {
      gap: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 1;
    }
  }

  .bookingNumber {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 500;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(22);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .bookingMessage {
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-dark);
    padding: rem(16) 0;
  }

  .qrCode {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    order: 2;
    
    @media (min-width: #{size.$desktopMin}) {
      order: 0;
      justify-content: flex-end;
    }
  }

  .qrCanvas {
    border: rem(1) solid var(--a-black);
    width: rem(100);
    height: rem(100);

    @media (min-width: #{size.$tablet}) {
      width: rem(120);
      height: rem(120);
    }

    @media (min-width: #{size.$desktopMin}) {
      width: rem(140);
      height: rem(140);
    }
  }

  .actionButtons {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    order: 1;

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      order: 0;
    }
  }

  .confirmationText {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.5;
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .finalButtons {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: space-between;
      gap: rem(16);
    }
  }

  .cancelButtonWrapper {
    display: flex;
    flex-direction: column;
  }

  .divider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-black);
  }
</style>

