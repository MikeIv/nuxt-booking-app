<script setup lang="ts">
  import { formatCount } from "~/utils/declension";
  import type { Room } from "~/types/room";

  interface Props {
    room: Room;
  }

  const props = defineProps<Props>();
  const router = useRouter();
  const bookingStore = useBookingStore();
  const { date, guests } = storeToRefs(bookingStore);
  const loading = ref(false);
  const isPopupOpen = ref(false);

  const nightsCount = computed(() => {
    if (
      !date.value ||
      date.value.length < 2 ||
      !date.value[0] ||
      !date.value[1]
    ) {
      return 0;
    }

    const checkIn = new Date(date.value[0]);
    const checkOut = new Date(date.value[1]);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  });

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const handleTariff = async () => {
    if (!date.value || date.value.length < 2) {
      console.error("Не выбраны даты бронирования");
      return;
    }

    bookingStore.setSelectedRoomType(props.room.room_type_code);

    await router.push("/rooms/tariff");
  };
</script>

<template>
  <section :class="$style.card">
    <header :class="$style.carouselWrapper">
      <BookingCarousel
        :images="room.photos || []"
        :alt-prefix="'Фото номера'"
        :alt-text="room.title"
        height="326px"
      />
    </header>

    <main :class="$style.cardDetails">
      <div :class="$style.roomInfo">
        <span :class="$style.title">{{ room.title }}</span>

        <button
          :class="$style.infoButton"
          data-popup-button
          @click="openPopup($event)"
        >
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            :class="$style.chevronIcon"
          />
        </button>
      </div>

      <div :class="$style.description">
        <div :class="$style.item">
          <UIcon name="i-persons" :class="$style.icon" />
          <span :class="$style.itemTitle">
            До {{ formatCount(room.max_occupancy, "capacity") }}
          </span>
        </div>
        <div :class="$style.item">
          <UIcon name="i-square" :class="$style.icon" />
          <span :class="$style.itemTitle">{{ room.square }} м²</span>
        </div>
        <div :class="$style.item">
          <UIcon name="i-dash-square" :class="$style.icon" />
          <span :class="$style.itemTitle">
            {{ formatCount(room.rooms, "chamber") }}
          </span>
        </div>
      </div>

      <div :class="$style.footer">
        <div :class="$style.priceBlock">
          <span :class="$style.guestInfo">
            {{ formatCount(guests?.adults, "guest") }} /
            {{ formatCount(nightsCount, "night") }}
          </span>
          <span :class="$style.price">От {{ room.min_price }} руб.</span>
        </div>

        <button
          :class="[$style.bookingButton, { [$style.loading]: loading }]"
          :disabled="loading || !date || date.length < 2"
          @click="handleTariff"
        >
          <span v-if="loading">Загрузка...</span>
          <span v-else>Забронировать</span>
        </button>
      </div>
    </main>

    <BookingRoomPopup :room="room" :is-open="isPopupOpen" @close="closePopup" />
  </section>
</template>

<style module lang="scss">
  .card {
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: rem(18) rem(14);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    border-radius: var(--a-borderR--card);
    overflow: hidden;
    position: relative;
  }

  .carouselWrapper {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: rem(20);
    min-height: rem(326);
  }

  .cardDetails {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .roomInfo {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: rem(12);
    margin-bottom: rem(16);
  }

  .title {
    display: inline-flex;
    flex-shrink: 1;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: bold;
    color: var(--a-text-dark);
  }

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32);
    height: rem(32);
    min-width: auto;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-primaryBg);
      border: none;

      .chevronIcon {
        color: var(--a-white);
      }
    }
  }

  .chevronIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-black);
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: rem(60);
  }

  .item {
    display: flex;
    gap: rem(8);
    align-items: center;
    width: 50%;
    margin-bottom: rem(8);
  }

  .icon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
  }

  .itemTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .priceBlock {
    display: flex;
    flex-direction: column;
  }

  .guestInfo {
    margin-bottom: rem(4);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .price {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .bookingButton {
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
    padding: rem(8) rem(16);
    border: none;
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.loading {
      background-color: var(--a-btnAccentBg);
    }
  }
</style>
