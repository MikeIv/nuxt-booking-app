<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { storeToRefs } from "pinia";
  import { useNights } from "~/composables/useNights";

  definePageMeta({
    layout: "steps",
  });

  interface SelectedEntry {
    roomIdx: number;
    roomTitle: string;
    ratePlanCode: string;
    price: number | null | undefined;
    title: string;
  }

  const router = useRouter();
  const bookingStore = useBookingStore();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    roomTariffs,
    date,
    selectedServices,
    loading,
    isServerRequest,
  } = storeToRefs(bookingStore);

  const nights = useNights(date);

  // Получаем выбранный номер
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
    return !!(selectedRoom.value && selectedTariff.value);
  });

  const bookingNumber = ref<string | null>(null);
  
  watch(
    isBookingCreated,
    (created) => {
      if (created && !bookingNumber.value) {
        bookingNumber.value = `BR-${Date.now().toString().slice(-8)}`;
      } else if (!created) {
        bookingNumber.value = null;
      }
    },
    { immediate: true },
  );

  // Получаем email из формы (в реальном приложении это должно приходить из ответа API)
  // TODO: Заменить на реальные данные из API после создания бронирования
  const guestEmail = computed(() => {
    return "mail@mail.ru";
  });

  const selectedEntry = computed<SelectedEntry | null>(() => {
    if (!selectedRoom.value || !selectedTariff.value) return null;
    
    return {
      roomIdx: 0,
      roomTitle: selectedRoom.value.title || "",
      ratePlanCode: selectedTariff.value.rate_plan_code,
      price: selectedTariff.value.price,
      title: selectedTariff.value.title || "",
    };
  });

  const selectedByRoomIdx = computed<Record<number, SelectedEntry>>(() => {
    const entry = selectedEntry.value;
    return entry ? { 0: entry } : ({} as Record<number, SelectedEntry>);
  });

  const bookingTotal = computed(() => {
    const tariffPrice = selectedTariff.value?.price;
    if (!tariffPrice || nights.value === 0) return 0;
    
    const roomTotal = tariffPrice * nights.value;
    const servicesTotal = selectedServices.value.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );
    
    return roomTotal + servicesTotal;
  });

  onMounted(() => {
    if (loading.value && isServerRequest.value) {
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }
  });

  const handleDownload = () => {
    // Логика скачивания подтверждения
    console.log("Скачать подтверждение");
  };

  const handlePrint = () => {
    // Логика печати
    window.print();
  };

  const handleChangeDates = () => {
    router.push("/");
  };

  const handleChangeRoom = () => {
    router.push("/rooms");
  };

  const handleChangeServices = () => {
    router.push("/services");
  };

  const handleChangeContacts = () => {
    router.push("/personal");
  };

  const handleCancelBooking = () => {
    // Логика отмены бронирования
    console.log("Отменить бронирование");
  };

  const handleNewBooking = () => {
    bookingStore.forceReset();
    router.push("/");
  };
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Ваше бронирование</h1>
    <section :class="$style.contentBlock">
      <div :class="$style.contentWrapper">
        <div :class="$style.mainContent">
          <div :class="$style.section">
            <h2 :class="$style.sectionTitle">Номер бронирования</h2>
            <div v-if="isBookingCreated && bookingNumber" :class="$style.bookingNumber">
              {{ bookingNumber }}
            </div>
            <div v-else :class="$style.bookingMessage">
              Обновите бронирование
            </div>
            <div v-if="isBookingCreated" :class="$style.actionButtons">
              <Button
                label="Скачать подтверждение"
                class="btn__bs ghost"
                unstyled
                @click="handleDownload"
              />
              <Button
                label="Распечатать"
                class="btn__bs ghost"
                unstyled
                @click="handlePrint"
              />
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

          <div :class="$style.section">
            <h3 :class="$style.sectionTitle">Управление бронированием</h3>
            <p :class="$style.managementText">
              Если это не противоречит условиям Вашего тарифа, Вы можете:
            </p>
            <div :class="$style.managementButtons">
              <Button
                label="Изменить даты"
                class="btn__bs ghost"
                unstyled
                @click="handleChangeDates"
              />
              <Button
                label="Изменить номер"
                class="btn__bs ghost"
                unstyled
                @click="handleChangeRoom"
              />
              <Button
                label="Изменить услуги"
                class="btn__bs ghost"
                unstyled
                @click="handleChangeServices"
              />
              <Button
                label="Изменить контакты"
                class="btn__bs ghost"
                unstyled
                @click="handleChangeContacts"
              />
            </div>
          </div>

          <div :class="$style.divider" />

          <div :class="$style.section">
            <div :class="$style.finalButtons">
              <Button
                label="Отменить бронирование"
                class="btn__bs ghost"
                unstyled
                @click="handleCancelBooking"
              />
              <Button
                label="Новое бронирование"
                class="btn__bs dark"
                unstyled
                @click="handleNewBooking"
              />
            </div>
          </div>
        </div>

        <div :class="$style.summaryWrapper">
          <BookingSummary
            :selected-entries="selectedByRoomIdx"
            :date="date"
            :nights="nights"
            :booking-total="bookingTotal"
          />
        </div>
      </div>
    </section>
  </div>
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
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }

  .contentBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(12) rem(20);

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
      align-items: start;
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
      width: 100%;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(24) 0;
  }

  .sectionTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .bookingNumber {
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .bookingMessage {
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-dark);
    padding: rem(16) 0;
  }

  .actionButtons {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
    }
  }

  .confirmationText {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.5;
    margin: 0;
  }

  .managementText {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.5;
    margin: 0;
  }

  .managementButtons {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(16);
    @media (min-width: #{size.$tablet}) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .finalButtons {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
    }
  }

  .divider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-black);
  }
</style>

