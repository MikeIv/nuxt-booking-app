<script setup lang="ts">
  import { useAuthStore } from "~/stores/auth";
  import { useBookingStore } from "~/stores/booking";
  import { useNotificationToast } from "~/composables/useToast";
  import { useUserProfile } from "~/composables/useUserProfile";
  import { useBookingHistory } from "~/composables/useBookingHistory";
  import CabinetNavigation from "~/components/cabinet/CabinetNavigation.vue";
  import CabinetPersonalData from "~/components/cabinet/CabinetPersonalData.vue";
  import CabinetBookings from "~/components/cabinet/CabinetBookings.vue";

  const router = useRouter();
  const authStore = useAuthStore();
  const bookingStore = useBookingStore();
  const toast = useNotificationToast();

  const activeSection = ref("personal");

  const {
    formData,
    isLoadingProfile,
    isSaving,
    hasChanges,
    checkChanges,
    saveChanges,
    fetchUserProfile,
  } = useUserProfile();

  const {
    bookingHistory,
    isLoadingBookings,
    bookingsLoaded,
    showLoadMoreButton,
    loadMoreButtonLabel,
    fetchBookingHistory,
    handleLoadMoreClick,
  } = useBookingHistory();

  const handleError = (err: unknown, defaultMessage: string, summary = "Ошибка") => {
    if (import.meta.dev) {
      console.error("💥 Ошибка:", err);
    }
    const message = (err as { message?: string })?.message || defaultMessage;
    toast.add({
      severity: "error",
      summary,
      detail: message,
      life: 5000,
    });
  };

  const handleNewBooking = async () => {
    await router.push("/");
  };

  const handleSectionChange = async (section: string) => {
    activeSection.value = section;
    if (section === "bookings" && !bookingsLoaded.value) {
      await fetchBookingHistory(true);
    }
  };

  const viewBookingDetails = async (bookingId: string | number) => {
    // Ищем бронирование по ID (сравниваем как строки для универсальности)
    const booking = bookingHistory.value.find((b) =>
      String(b.id) === String(bookingId)
    );

    if (booking) {
      bookingStore.setCurrentBookingDetails(booking);
    } else {
      bookingStore.setCurrentBookingDetails(null);
    }

    await router.push(`/booking-details?id=${encodeURIComponent(String(bookingId))}`);
  };

  const handleFormDataUpdate = (updatedData: typeof formData) => {
    Object.assign(formData, updatedData);
  };

  const handleLogout = async () => {
    if (import.meta.dev) {
      console.log("🔄 Выход из системы...");
    }

    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const { post } = useApi();
      const response = await post("/v1/auth/logout");

      if (response.success) {
        authStore.logout();
        await router.push("/");
      } else {
        authStore.logout();
        toast.add({
          severity: "error",
          summary: "Ошибка выхода",
          detail: response.message || "Не удалось выполнить выход. Попробуйте позже.",
          life: 5000,
        });
        await router.push("/");
      }
    } catch (err: unknown) {
      authStore.logout();
      handleError(err, "Не удалось выполнить выход. Попробуйте позже.", "Ошибка выхода");
      await router.push("/");
    } finally {
      authStore.setLoading(false);
    }
  };

  onMounted(async () => {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;

    if (authStore.user) {
      await fetchUserProfile();
    }
  });
</script>

<template>
  <main :class="$style.cabinet">
    <h1 :class="$style.header">Личный кабинет</h1>

    <div :class="$style.container">
      <CabinetNavigation
        :active-section="activeSection"
        @section-change="handleSectionChange"
        @new-booking="handleNewBooking"
        @logout="handleLogout"
      />

      <CabinetPersonalData
        v-if="activeSection === 'personal'"
        :form-data="formData"
        :is-loading="isLoadingProfile"
        :is-saving="isSaving"
        :has-changes="hasChanges"
        @update:form-data="handleFormDataUpdate"
        @check-changes="checkChanges"
        @save="saveChanges"
      />

      <CabinetBookings
        v-if="activeSection === 'bookings'"
        :bookings="bookingHistory"
        :is-loading="isLoadingBookings"
        :bookings-loaded="bookingsLoaded"
        :show-load-more-button="showLoadMoreButton"
        :load-more-button-label="loadMoreButtonLabel"
        @new-booking="handleNewBooking"
        @load-more="handleLoadMoreClick"
        @view-details="viewBookingDetails"
      />
    </div>
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cabinet {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: #{size.$desktopMax};
    margin: rem(40) auto rem(40);
    padding: 0 rem(20);

    @media (min-width: #{size.$desktopMax}) {
      padding: rem(20);
    }
  }

  .header {
    margin: rem(40) 0;
    padding: 0;
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(34);
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(40);
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      gap: rem(40);
    }
  }
</style>
