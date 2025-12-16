<script setup lang="ts">
import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import type { BookingDetailsRoom } from "~/types/booking-details";
import { HOTEL_INFO } from "~/utils/hotel";
import { useNotificationToast } from "~/composables/useToast";

const router = useRouter();
const route = useRoute();
const bookingStore = useBookingStore();
const authStore = useAuthStore();
const toast = useNotificationToast();

const { currentBookingDetails } = storeToRefs(bookingStore);
const bookingDetails = currentBookingDetails;
const isLoadingDetails = ref(false);

const bookingNumber = computed(() => {
  return (
    bookingDetails.value?.confirmation_number ||
    bookingDetails.value?.id ||
    undefined
  );
});

const rooms = computed<BookingDetailsRoom[] | undefined>(() => {
  return bookingDetails.value?.rooms;
});

const totalPrice = computed(() => {
  return bookingDetails.value?.total_price || 0;
});

const nights = computed(() => {
  return bookingDetails.value?.order?.nights || 0;
});

const userPhone = computed(() => {
  const phoneFromBooking = 
    bookingDetails.value?.rooms?.[0]?.guests?.main?.phone || 
    bookingDetails.value?.order?.phone;
  
  return phoneFromBooking || authStore.user?.phone || '—';
});

const userEmail = computed(() => {
  return bookingDetails.value?.rooms?.[0]?.guests?.main?.email || '—';
});

const hasPdf = computed(() => {
  return !!bookingDetails.value?.order?.pdf;
});

const handleDownload = () => {
  const pdfUrl = bookingDetails.value?.order?.pdf;
  if (pdfUrl) {
    window.open(pdfUrl, "_blank");
  }
};

const handlePrint = () => {
  window.print();
};

const handleCancelBooking = () => {
  console.log("Отменить бронирование");
  // TODO: Реализовать отмену бронирования
};

const handleNewBooking = async () => {
  bookingStore.forceReset();
  await router.push("/");
};

const handleBackToCabinet = async () => {
  await router.push("/cabinet");
};

const handleChangeDates = () => {
  console.log("Изменить даты");
  // TODO: Реализовать изменение дат
};

const handleChangeRoom = () => {
  console.log("Изменить номер");
  // TODO: Реализовать изменение номера
};

const handleChangeServices = () => {
  console.log("Изменить услуги");
  // TODO: Реализовать изменение услуг
};

const handleChangeContacts = () => {
  console.log("Изменить контакты");
  // TODO: Реализовать изменение контактов
};

onMounted(async () => {
  // Если данных нет в store, загружаем их через API
  if (!bookingDetails.value) {
    const bookingId = route.query.id;
    
    if (!bookingId) {
      if (import.meta.dev) {
        console.warn("⚠️ ID бронирования не указан в query параметрах");
      }
      await router.push("/cabinet");
      return;
    }

    isLoadingDetails.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Загрузка деталей бронирования через API...", {
          bookingId,
        });
      }

      await bookingStore.getBookingDetails(
        typeof bookingId === "string" ? bookingId : String(bookingId),
      );

      if (import.meta.dev) {
        console.log("✅ Детали бронирования загружены");
      }
    } catch (err: unknown) {
      if (import.meta.dev) {
        console.error("❌ Ошибка загрузки деталей бронирования:", err);
      }

      const errorMessage =
        (err as { message?: string })?.message ||
        "Не удалось загрузить детали бронирования";

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
        life: 5000,
      });

      await router.push("/cabinet");
    } finally {
      isLoadingDetails.value = false;
    }
  }
});
</script>

<template>
  <main :class="$style.container">
    <h1 :class="$style.header">Детали бронирования</h1>

    <article v-if="bookingDetails" :class="$style.content">
      <BookingDetailsHeader
        :booking-number="bookingNumber"
        :pdf-url="bookingDetails.order?.pdf"
        :has-pdf="hasPdf"
        @download="handleDownload"
        @print="handlePrint"
      />

      <hr :class="$style.divider" />

      <BookingDetailsManagement
        @change-dates="handleChangeDates"
        @change-room="handleChangeRoom"
        @change-services="handleChangeServices"
        @change-contacts="handleChangeContacts"
      />

      <hr :class="$style.divider" />

      <BookingDetailsHotelInfo
        :name="HOTEL_INFO.name"
        :address="HOTEL_INFO.address"
        :phone="HOTEL_INFO.phone"
        :email="HOTEL_INFO.email"
        :image-url="HOTEL_INFO.imageUrl"
      />

      <hr :class="$style.divider" />

      <BookingDetailsSummary
        :start-date="bookingDetails.order?.start_at"
        :end-date="bookingDetails.order?.end_at"
        :nights="nights"
        :rooms="rooms"
        :total-price="totalPrice"
      />

      <hr :class="$style.divider" />

      <BookingDetailsPersonalInfo
        :name="bookingDetails.order?.name"
        :surname="bookingDetails.order?.surname"
        :nationality="bookingDetails.order?.nationality"
        :phone="userPhone"
        :email="userEmail"
        :comment="bookingDetails.order?.comment ?? undefined"
        :payment-method="bookingDetails.order?.payment_method"
      />

      <hr :class="$style.divider" />

      <BookingDetailsActions
        @cancel="handleCancelBooking"
        @new-booking="handleNewBooking"
        @back-to-cabinet="handleBackToCabinet"
      />
    </article>

    <section v-else-if="!isLoadingDetails" :class="$style.notFound">
      <p>Бронирование не найдено</p>
      <Button
        class="btn__bs dark"
        unstyled
        @click="handleBackToCabinet"
      >
        Вернуться в кабинет
      </Button>
    </section>

    <section v-else :class="$style.loading">
      <p>Загрузка деталей бронирования...</p>
    </section>
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto rem(40);
    padding: rem(20);

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
    }
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: rem(24) 0 rem(32);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    line-height: 1.3;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(30);
      margin: rem(32) 0 rem(40);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
      margin: rem(40) 0 rem(48);
    }
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .notFound {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(20);
    padding: rem(40) 0;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(20);
    padding: rem(40) 0;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .divider {
    width: 100%;
    height: rem(1);
    margin: 0;
    padding: 0;
    border: none;
    background-color: var(--a-black);
  }
</style>
