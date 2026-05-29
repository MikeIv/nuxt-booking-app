<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useAuthStore } from "~/stores/auth";
  import { storeToRefs } from "pinia";
  import type { SelectedEntry, BookingByUuidRoom } from "~/types/booking";
  import { toPricePerNight, toStayTotal } from "~/utils/price";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const route = useRoute();
  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
  const toast = useNotificationToast();
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
    return roomTariffs.value.find((room) => room.room_type_code === selectedRoomType.value) || null;
  });

  const selectedTariff = computed(() => {
    if (selectedTariffStore.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  const isBookingCreated = computed(() => !!createdBooking.value);

  const bookingNumber = computed(() => {
    const booking = createdBooking.value;
    if (!booking) return null;
    if (booking.confirmation_number) return booking.confirmation_number;
    if (booking.id !== undefined && booking.id !== null) return String(booking.id);
    return null;
  });

  const confirmationEmail = computed(() => {
    const order = createdBooking.value?.order as Record<string, unknown> | undefined;
    const orderEmail = order?.email;
    if (typeof orderEmail === "string" && orderEmail.trim() !== "") return orderEmail.trim();

    const firstRoom = Array.isArray(createdBooking.value?.rooms)
      ? (createdBooking.value.rooms[0] as Record<string, unknown> | undefined)
      : undefined;
    const guests = Array.isArray(firstRoom?.guests)
      ? (firstRoom.guests as Array<Record<string, unknown>>)
      : [];
    const mainGuest = guests.find((guest) => guest.is_main === true) ?? guests[0] ?? null;
    const guestEmail = typeof mainGuest?.email === "string" ? mainGuest.email.trim() : "";
    if (guestEmail) return guestEmail;

    const userEmail = authStore.user?.email;
    return typeof userEmail === "string" ? userEmail.trim() : "";
  });

  const pdfUrl = computed(() => createdBooking.value?.order?.pdf || null);

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
  const hasManagementActions = computed(
    () => canEditDates.value || canEditRoom.value || canEditPackages.value || canEditContacts.value,
  );

  const currentBookingUuid = computed<string | null>(() => {
    if (currentBookingUuidStore.value?.trim()) return currentBookingUuidStore.value;
    const fromStore = createdBooking.value?.uuid;
    if (fromStore && String(fromStore).trim() !== "") return String(fromStore);
    const fromQuery = route.query.uuid;
    if (typeof fromQuery === "string" && fromQuery.trim() !== "") return fromQuery;
    return null;
  });

  const selectedByRoomIdx = computed<Record<string, SelectedEntry>>(() => {
    if (createdBooking.value?.rooms && Array.isArray(createdBooking.value.rooms)) {
      const entries: Record<string, SelectedEntry> = {};
      (createdBooking.value.rooms as BookingByUuidRoom[]).forEach((room, index) => {
        const pricePerNight = nights.value > 0 ? room.total / nights.value : room.total;
        entries[index.toString()] = {
          roomIdx: index,
          roomCardIdx: index,
          roomTitle: room.title || "",
          room_type_code: "",
          ratePlanCode: "",
          price: pricePerNight,
          title: room.tariff.title || "",
        };
      });
      return entries;
    }

    if (!selectedRoom.value || !selectedTariff.value) return {};

    return {
      "0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: selectedRoom.value.title || "",
        room_type_code: selectedRoom.value.room_type_code,
        ratePlanCode: selectedTariff.value.rate_plan_code,
        price: toPricePerNight(selectedTariff.value.price, nights.value),
        title: selectedTariff.value.title || "",
      },
    };
  });

  const bookingTotal = computed(() => {
    if (createdBooking.value && "total_price" in createdBooking.value) {
      return (createdBooking.value.total_price as number) || 0;
    }
    const tariffPrice = selectedTariff.value?.price;
    if (!tariffPrice || nights.value === 0) return 0;
    const servicesTotal = selectedServices.value.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );
    return (
      toStayTotal(toPricePerNight(tariffPrice, nights.value), nights.value) +
      servicesTotal
    );
  });

  // --- Composables ---
  const { qrCanvas } = useConfirmationQR(pdfUrl);

  const {
    isCancelBookingPopupOpen,
    isCancellingBooking,
    cancelBookingError,
    openCancelBookingPopup,
    closeCancelBookingPopup,
    confirmCancelBooking,
  } = useBookingCancel(currentBookingUuid, bookingNumber, confirmationEmail);

  const {
    isChangeContactsPopupOpen,
    isChangingContacts,
    changeContactsError,
    changeContactsSuccess,
    contactForm,
    canSubmitContactChange,
    openChangeContactsPopup,
    closeChangeContactsPopup,
    confirmChangeContacts,
  } = useBookingChangeContacts(currentBookingUuid);

  const {
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
  } = useBookingChangeDates(currentBookingUuid, bookingDate);

  const {
    isChangeRoomPopupOpen,
    isChangingRoom,
    changeRoomError,
    changeRoomSuccess,
    openChangeRoomPopup,
    closeChangeRoomPopup,
    confirmChangeRoom,
  } = useBookingChangeRoom(currentBookingUuid);

  const {
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
  } = useBookingChangeServices(currentBookingUuid);

  // --- Watchers ---
  watch(
    () => createdBooking.value,
    (booking) => {
      if (booking?.rooms && Array.isArray(booking.rooms)) {
        const rooms = booking.rooms as Array<{ adults?: number; children?: number }>;
        bookingStore.setGuests({
          rooms: rooms.length,
          roomList: rooms.map((room) => ({
            adults: room.adults || 0,
            children: room.children || 0,
            childrenAges: [] as number[],
          })),
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => isBookingCreated.value,
    (isCreated) => {
      if (isCreated && !authStore.isAuthenticated && typeof window !== "undefined") {
        sessionStorage.setItem("hasUnauthenticatedBooking", "true");
      }
    },
    { immediate: true },
  );

  onMounted(async () => {
    if (loading.value && isServerRequest.value) {
      bookingStore.setLoading(false);
      bookingStore.setServerRequest(false);
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

    if (
      bookingStore.changeRoomUuid &&
      bookingStore.changeRoomUuid === effectiveBookingUuid &&
      bookingStore.selectedRoomType
    ) {
      openChangeRoomPopup();
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
      const headers: HeadersInit = authStore.token
        ? { Authorization: `Bearer ${authStore.token}` }
        : {};
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Ошибка загрузки PDF: ${response.statusText}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `booking-confirmation-${bookingNumber.value || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
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

    if (typeof window === "undefined") return;

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
      if (typeof printWindow.print === "function") printWindow.print();
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleChangeRoom = () => {
    if (bookingDate.value) {
      bookingStore.setDate([...bookingDate.value] as [Date, Date]);
    }
    bookingStore.setSearchResults(null);
    bookingStore.setSelectedRoomType(null);
    bookingStore.setSelectedTariff(null);
    bookingStore.setChangeRoomUuid(currentBookingUuid.value);
    router.push("/rooms");
  };

  const handleNewBooking = () => {
    bookingStore.forceReset();
    router.push("/");
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
                электронную почту:
                <br v-if="confirmationEmail">
                <span v-if="confirmationEmail">
                  <strong>{{ confirmationEmail }}</strong>
                </span>
              </p>
            </div>

            <div :class="$style.divider" />

            <BookingConfirmationManagement
              :has-management-actions="hasManagementActions"
              :can-edit-dates="canEditDates"
              :can-edit-room="canEditRoom"
              :can-edit-packages="canEditPackages"
              :can-edit-contacts="canEditContacts"
              @change-dates="openChangeDatesPopup"
              @change-room="handleChangeRoom"
              @change-services="openChangeServicesPopup"
              @change-contacts="openChangeContactsPopup"
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
    <BookingConfirmationChangeRoomPopup
      :is-open="isChangeRoomPopupOpen"
      :is-changing-room="isChangingRoom"
      :change-room-success="changeRoomSuccess"
      :change-room-error="changeRoomError"
      @close="closeChangeRoomPopup"
      @confirm="confirmChangeRoom"
    />
    <BookingConfirmationChangeServicesPopup
      :is-open="isChangeServicesPopupOpen"
      :is-loading-packages="isLoadingPackages"
      :is-changing-services="isChangingServices"
      :available-packages="availablePackages"
      :selected-package-codes="selectedPackageCodes"
      :change-services-success="changeServicesSuccess"
      :change-services-error="changeServicesError"
      @close="closeChangeServicesPopup"
      @confirm="confirmChangeServices"
      @toggle-package="togglePackage"
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
