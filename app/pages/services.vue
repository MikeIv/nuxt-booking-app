<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useToast as usePrimeToast } from "primevue/usetoast";
  import type { Room, RoomTariff } from "~/types/room";

  const { getBannersByVisibility } = useBanners();

  const servicesBanners = computed(() => {
    return getBannersByVisibility("booking");
  });

  interface SelectedEntry {
    roomIdx: number;
    roomTitle: string;
    ratePlanCode: string;
    price: number;
    title: string;
  }

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const toast = usePrimeToast();
  const bookingStore = useBookingStore();
  const { selectedRoomType, selectedTariff: selectedTariffStore, roomTariffs, date, selectedServices } =
    storeToRefs(bookingStore);

  // Получаем выбранный номер
  const selectedRoom = computed<Room | null>(() => {
    if (!roomTariffs.value?.length) return null;
    return (
      roomTariffs.value.find(
        (room) => room.room_type_code === selectedRoomType.value,
      ) || roomTariffs.value[0] || null
    );
  });

  const selectedTariff = computed<RoomTariff | null>(() => {
    if (selectedTariffStore?.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  // Вычисляем количество ночей
  const nights = useNights(date);

  const bookingTotal = computed(() => {
    if (!selectedTariff.value?.price) return 0;
    const roomTotal = selectedTariff.value.price * nights.value;
    const servicesTotal = selectedServices.value.reduce((sum, s) => sum + s.price, 0);
    return roomTotal + servicesTotal;
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

  // Преобразуем selectedEntry в формат для BookingSummary
  // Используется только когда selectedEntry не null (проверка в template)
  const selectedByRoomIdx = computed<Record<number, SelectedEntry>>(() => {
    const entry = selectedEntry.value;
    if (!entry) return {} as Record<number, SelectedEntry>;
    return { 0: entry };
  });

  // Статичные данные для услуг (временно)
  const services = [
    { id: 1, title: "VIP - трансфер", price: 2500 },
    { id: 2, title: "Поздний выезд", price: 1500 },
    { id: 3, title: "Доступ в фитнес-зал", price: 800 },
    { id: 4, title: "Парковка", price: 500 },
  ];

  const isPopupOpen = ref(false);
  const expandedRoom = ref(false);

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const toggleExpand = () => {
    expandedRoom.value = !expandedRoom.value;
  };

  const handleContinue = () => {
    router.push("/personal");
  };

  onMounted(() => {
    // Проверяем наличие необходимых данных для отображения страницы
    if (!selectedRoom.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Номер не выбран",
        life: 3000,
      });
      router.push("/rooms");
      return;
    }
    if (!selectedTariff.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Тариф не выбран",
        life: 3000,
      });
      router.push("/rooms");
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор услуг</h1>
    <div v-if="servicesBanners.length > 0" :class="$style.bannersWrapper">
      <CommonBannersList :banners="servicesBanners" />
    </div>

    <section :class="$style.block">
      <div v-if="selectedRoom" :class="$style.twoCols">
        <div :class="$style.content">
          <BookingRoomInfoCard
            :room="selectedRoom"
            :expanded="expandedRoom"
            :hide-description="true"
            @open-popup="openPopup"
            @toggle-expand="toggleExpand"
          />

          <BookingRoomPopup
            :room="selectedRoom"
            :is-open="isPopupOpen"
            @close="closePopup"
          />

          <section :class="$style.servicesList">
            <BookingServiceCard
              v-for="service in services"
              :id="service.id"
              :key="service.id"
              :title="service.title"
              :price="service.price"
            />
          </section>
        </div>

        <div :class="$style.summaryWrapper">
          <BookingSummary
            v-if="selectedEntry"
            :selected-entries="selectedByRoomIdx"
            :date="date"
            :nights="nights"
            :booking-total="bookingTotal"
            @continue="handleContinue"
          />
        </div>
      </div>

      <div v-else :class="$style.noRoom">
        <p>Номер не выбран. Пожалуйста, вернитесь к выбору номера.</p>
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
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-black);
  }

  .bannersWrapper {
    margin-bottom: rem(20);
    width: 100%;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin-left: auto;
      margin-right: auto;
    }
  }

  .block {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 0 rem(40) 0;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .twoCols {
    display: flex;
    flex-direction: column;
    gap: rem(24);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);

    @media (min-width: #{size.$desktopMin}) {
      width: 66.6667%;
      margin-bottom: 0;
    }
  }

  .summaryWrapper {
    display: flex;
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      width: calc(100% / 3);
    }
  }

  .servicesList {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(20);
    width: 100%;
    padding: 0 rem(4) rem(40) rem(4);

    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: #{size.$desktopMin}) and (max-width: calc(#{size.$desktopMedium} - 1px)) {
      grid-template-columns: 1fr;
    }

    @media (min-width: #{size.$desktopMedium}) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .noRoom {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-text-accent);
    text-align: center;
  }
</style>
