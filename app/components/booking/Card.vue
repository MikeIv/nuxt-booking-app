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

  type CarouselItem = string | { placeholder: true; label?: string };

  const totalAdults = computed(() => {
    if (!guests.value?.roomList) return 0;
    return guests.value.roomList.reduce((sum, room) => sum + room.adults, 0);
  });

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

  const availableRoomVariants = computed<Room[]>(() => {
    const variants = props.room.room_type_codes ?? [];
    return variants.length > 0 ? variants : [props.room];
  });

  const selectedBedType = ref<string | null>(null);

  watch(
    availableRoomVariants,
    (variants) => {
      const fallbackFromProps = props.room.room_type_code;
      const fallbackVariant =
        variants.find(
          (variant) =>
            variant.room_type_code === fallbackFromProps && variant.bed?.title,
        ) ??
        variants.find((variant) => variant.bed?.title) ??
        variants[0];
      const fallback = fallbackVariant?.room_type_code ?? fallbackFromProps;

      if (!fallback) {
        selectedBedType.value = null;
        return;
      }

      const hasCurrentSelection = variants.some(
        (variant) => variant.room_type_code === selectedBedType.value,
      );

      if (!hasCurrentSelection) {
        selectedBedType.value = fallback;
      }
    },
    { immediate: true },
  );

  const bedOptions = computed(() => {
    const seenTitles = new Set<string>();

    return availableRoomVariants.value
      .map((variant, index) => {
        const bedTitle = variant.bed?.title?.trim();

        if (!bedTitle) {
          return null;
        }

        return {
          id: variant.room_type_code || String(index),
          title: bedTitle,
        };
      })
      .filter((option) => {
        if (!option) return false;
        if (seenTitles.has(option.title)) return false;

        seenTitles.add(option.title);
        return true;
      }) as { id: string; title: string }[];
  });

  const currentRoom = computed<Room>(() => {
    const variants = availableRoomVariants.value;
    const fallbackRoom =
      variants.find(
        (variant) => variant.room_type_code === selectedBedType.value,
      ) ??
      variants.find((variant) => variant.bed?.title) ??
      variants[0] ??
      props.room;

    const found = variants.find(
      (variant) => variant.room_type_code === selectedBedType.value,
    );

    return found ?? fallbackRoom;
  });

  const placeholderSlides: CarouselItem[] = Array.from({ length: 4 }, () => ({
    placeholder: true,
    label: "Room Photo",
  }));

  const carouselImages = computed<CarouselItem[]>(() => {
    const roomData = currentRoom.value;

    if (roomData.photos && roomData.photos.length > 0) {
      return roomData.photos;
    }

    return placeholderSlides;
  });

  const handleTariff = async () => {
    if (!date.value || date.value.length < 2) {
      console.error("Не выбраны даты бронирования");
      return;
    }

    const roomData = currentRoom.value;

    bookingStore.setSelectedRoomType(roomData.room_type_code);

    const roomsCount = bookingStore.guests?.roomList
      ? bookingStore.guests.roomList.length
      : bookingStore.guests?.rooms || 1;

    const target = roomsCount > 1 ? "/multi-rooms" : "/rooms/tariff";
    await router.push(target);
  };
</script>

<template>
  <section :class="$style.card">
    <header :class="$style.carouselWrapper">
      <BookingCarousel
        :images="carouselImages"
        :alt-prefix="'Фото номера'"
        :alt-text="currentRoom.title"
        height="326px"
      />
    </header>

    <main :class="$style.cardDetails">
      <div :class="$style.wrapperInfoBlock">
        <div :class="$style.roomInfo">
          <span :class="$style.title">{{ currentRoom.title }}</span>

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
              До {{ formatCount(currentRoom.max_occupancy, "capacity") }}
            </span>
          </div>
          <div :class="$style.item">
            <UIcon name="i-square" :class="$style.icon" />
            <span :class="$style.itemTitle">{{ currentRoom.square }} м²</span>
          </div>
          <div :class="$style.item">
            <UIcon name="i-dash-square" :class="$style.icon" />
            <span :class="$style.itemTitle">
              {{ formatCount(currentRoom.rooms, "chamber") }}
            </span>
          </div>
        </div>

        <div :class="$style.priceBlock">
          <span :class="$style.guestGift">
            <UIcon name="i-gift-line" :class="$style.icon" />
            За регистрацию {{ currentRoom.price_for_register }} ₽
          </span>
          <span :class="$style.price">От {{ currentRoom.min_price }} руб.</span>
          <span :class="$style.guestInfo">
            {{ formatCount(totalAdults, "guest") }} /
            {{ formatCount(nightsCount, "night") }}
          </span>

          <span
            :class="$style.guestInfo"
            style="font-size: 10px; text-decoration: underline"
          >
            Тест кода: {{ currentRoom.room_type_code }}
          </span>
        </div>
      </div>

      <div :class="$style.footer">
        <div :class="$style.bedSelect">
          <span :class="$style.bedSelectLabel">Тип кровати:</span>
          <Select
            v-model="selectedBedType"
            :options="bedOptions"
            option-label="title"
            option-value="id"
            placeholder="Тип кровати"
          />
        </div>

        <Button
          unstyled
          class="btn__bs"
          :class="[$style.bookingButton, { [$style.loading]: loading }]"
          :disabled="loading || !date || date.length < 2"
          @click="handleTariff"
        >
          <span v-if="loading">Загрузка...</span>
          <span v-else>Выбрать номер</span>
        </Button>
      </div>
    </main>

    <BookingRoomPopup
      :room="currentRoom"
      :is-open="isPopupOpen"
      @close="closePopup"
    />
  </section>
</template>

<style module lang="scss">
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: rem(18) rem(14);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    border-radius: var(--a-borderR--card);
    overflow: hidden;
  }

  .carouselWrapper {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: rem(20);
    min-height: rem(326);
    justify-content: center;
    align-items: center;

    :global(.p-carousel) {
      width: 100%;
    }
  }

  .cardDetails {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .wrapperInfoBlock {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: rem(16);
    padding: 0 rem(16);
  }

  .roomInfo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(12);
  }

  .title {
    display: inline-flex;
    flex-shrink: 1;
    font-family: "Lora", serif;
    font-size: rem(22);
    font-weight: bold;
    color: var(--a-text-dark);
  }

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(40);
    height: rem(40);
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
    width: rem(26);
    height: rem(26);
    color: var(--a-black);
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    gap: rem(16);
  }

  .item {
    display: flex;
    gap: rem(8);
    align-items: center;
    margin-bottom: rem(8);
  }

  .icon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
  }

  .itemTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .bedSelect {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: rem(12);
    margin-bottom: rem(20);
    padding: 0 rem(16);

    :global(.p-select) {
      flex: 1 1 rem(220);
      min-width: rem(200);
      width: 100%;
      max-width: 100%;
      min-height: rem(44);
      padding: rem(8) rem(16);
      font-family: "Inter", sans-serif;
      font-size: rem(14);
      color: var(--a-text-dark);
      background: var(--a-text-white);
      border: rem(1) solid var(--a-border-primary);
      border-radius: var(--a-borderR--input);
    }
  }

  .bedSelectLabel {
    display: inline-flex;
    align-items: center;
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    color: var(--a-text-dark);
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .footer {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .priceBlock {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(12);
  }

  .guestInfo {
    margin-bottom: rem(4);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .guestGift {
    display: flex;
    align-items: center;
    gap: rem(4);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-accent);
    text-decoration: underline;
  }

  .giftIcon {
    width: rem(16);
    height: rem(16);
    margin-right: rem(4);
    vertical-align: middle;
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
    width: 100%;
    max-width: rem(274);
    height: fit-content;
    margin: 0 auto;
    padding: rem(8) rem(16);
    border: none;
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
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
