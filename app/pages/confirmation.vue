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
    createdBooking,
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
    return !!createdBooking.value;
  });

  // Получаем номер бронирования из ответа API
  const bookingNumber = computed(() => {
    return createdBooking.value?.id?.toString() || null;
  });

  // Получаем email из ответа API (из данных отеля)
  const guestEmail = computed(() => {
    return createdBooking.value?.hotel?.email || "";
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
              <div v-if="isBookingCreated" :class="$style.qrCode">
                <!-- QR-код будет здесь -->
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="120" height="120" fill="white"/>
                  <rect x="10" y="10" width="100" height="100" fill="black"/>
                </svg>
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

          <div :class="$style.section">
            <h3 :class="$style.sectionTitle">Управление бронированием</h3>
            <p :class="$style.managementText">
              Если это не противоречит условиям Вашего тарифа, Вы можете:
            </p>
            <div :class="$style.managementButtons">
              <Button
                label="Изменить даты"
                class="btn__bs dark"
                unstyled
                @click="handleChangeDates"
              />
              <Button
                label="Изменить номер"
                class="btn__bs dark"
                unstyled
                @click="handleChangeRoom"
              />
              <Button
                label="Изменить услуги"
                class="btn__bs dark"
                unstyled
                @click="handleChangeServices"
              />
              <Button
                label="Изменить контакты"
                class="btn__bs dark"
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
                class="btn__bs danger"
                unstyled
                @click="handleCancelBooking"
              />
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

    svg {
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

  .managementText {
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

  .managementButtons {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      grid-template-columns: repeat(2, 1fr);
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: repeat(4, 1fr);
    }

    // Запрет переноса текста в кнопках
    :global(.btn__bs) {
      white-space: nowrap;
      min-width: 0; // Позволяет кнопке сжиматься при необходимости
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

  .divider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-black);
  }
</style>

