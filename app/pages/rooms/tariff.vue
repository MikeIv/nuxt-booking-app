<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs } =
    storeToRefs(bookingStore);
  const loading = ref(true);
  const error = ref(null);
  const isPopupOpen = ref(false);
  const isServicePopupOpen = ref(false);
  const selectedService = ref(null);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const openServicePopup = (event: MouseEvent, service: unknown) => {
    event.stopPropagation();
    selectedService.value = service;
    isServicePopupOpen.value = true;
  };

  const closeServicePopup = () => {
    isServicePopupOpen.value = false;
    selectedService.value = null;
  };

  const expandedRooms = ref<Record<string, boolean>>({});

  const toggleExpand = (roomTitle: string) => {
    expandedRooms.value[roomTitle] = !expandedRooms.value[roomTitle];
  };

  const handleTariff = () => {
    router.push("/personal");
  };

  onMounted(async () => {
    try {
      loading.value = true;
      if (selectedRoomType.value) {
        await bookingStore.searchWithRoomType(selectedRoomType.value);
        console.log("TARIF-data", searchResults.value);
      }
    } catch (err) {
      error.value = err;
      console.error("Ошибка при загрузке тарифов:", err);
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">
      Выбор тарифа для номера {{ selectedRoomType }}
    </h1>

    <Booking />
    <BookingAdvantages />

    <section :class="$style.tariffBlock">
      <NuxtLink to="/rooms" :class="$style.return"
        >Назад к выбору номеров</NuxtLink
      >

      <!-- Индикатор загрузки -->
      <div v-if="loading" :class="$style.loadingContainer">
        <div :class="$style.spinner" />
        <p>Загрузка тарифов...</p>
      </div>

      <div v-else-if="error" :class="$style.errorContainer">
        <p>Произошла ошибка при загрузке тарифов. Попробуйте позже.</p>
      </div>

      <template v-else>
        <h2 :class="$style.tariffTitle">Выберите тариф</h2>

        <div
          v-if="roomTariffs && roomTariffs.length > 0"
          :class="$style.tariffs"
        >
          <div
            v-for="(room, roomIndex) in roomTariffs"
            :key="roomIndex"
            :class="$style.tariffCard"
          >
            <BookingRoomInfoCard
              :room="room"
              :is-open="isPopupOpen"
              @open-popup="openPopup"
              @toggle-expand="toggleExpand"
            />

            <BookingServicesList
              :services="searchResults.packages"
              :is-service-popup-open="isServicePopupOpen"
              @open-service-popup="openServicePopup"
            />

            <BookingTariffsList
              :tariffs="room.tariffs"
              @book-tariff="handleTariff"
            />

            <BookingRoomPopup
              :room="room"
              :is-open="isPopupOpen"
              @close="closePopup"
            />

            <BookingServicePopup
              v-if="selectedService"
              :service="selectedService"
              :is-open="isServicePopupOpen"
              @close="closeServicePopup"
            />
          </div>
        </div>

        <div
          v-else-if="searchResults && !searchResults.available"
          :class="$style.noResults"
        >
          <p>К сожалению, на выбранные даты нет доступных номеров.</p>
        </div>
      </template>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(60);
    }
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

  .tariffBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(40) 0;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .return {
    position: relative;
    margin-bottom: rem(40);
    padding-left: rem(30);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);

    &:before {
      content: "<";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 10px;
    }
  }

  .tariffTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);
  }

  .tariffCard {
    display: flex;
    flex-direction: column;
  }

  .noResults {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  .loadingContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: rem(40) 0;
  }

  .spinner {
    width: rem(40);
    height: rem(40);
    border: rem(3) solid var(--a-border-light);
    border-top: rem(3) solid var(--a-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: rem(16);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .errorContainer {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }
</style>
