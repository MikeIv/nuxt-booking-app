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

  // Константы для карусели
  const CAROUSEL_MIN_PHOTOS = 2;
  const CAROUSEL_TARGET_ITEMS = 3;
  const CAROUSEL_PLACEHOLDER_LABEL = "Room Photo";
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  // Проверка валидности дат
  const isValidDateRange = computed(() => {
    return (
      date.value &&
      date.value.length >= 2 &&
      date.value[0] &&
      date.value[1]
    );
  });

  const totalAdults = computed(() => {
    if (!guests.value?.roomList) return 0;
    return guests.value.roomList.reduce((sum, room) => sum + room.adults, 0);
  });

  const nightsCount = computed(() => {
    if (!isValidDateRange.value || !date.value) return 0;

    const [checkInDate, checkOutDate] = date.value;
    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / MILLISECONDS_PER_DAY);

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

  // Поиск варианта комнаты по коду
  const findVariantByCode = (variants: Room[], code: string | null) => {
    if (!code) return null;
    return variants.find((variant) => variant.room_type_code === code) ?? null;
  };

  // Поиск варианта с кроватью
  const findVariantWithBed = (variants: Room[]) => {
    return variants.find((variant) => variant.bed?.title) ?? null;
  };

  watch(
    availableRoomVariants,
    (variants) => {
      const fallbackFromProps = props.room.room_type_code;
      let fallbackVariant: Room | null = null;

      // Сначала пытаемся найти вариант с кодом из props, у которого есть кровать
      if (fallbackFromProps) {
        const variantWithCode = findVariantByCode(variants, fallbackFromProps);
        if (variantWithCode?.bed?.title) {
          fallbackVariant = variantWithCode;
        }
      }

      // Если не нашли, ищем любой вариант с кроватью
      if (!fallbackVariant) {
        fallbackVariant = findVariantWithBed(variants);
      }

      // Если и это не помогло, берем первый вариант
      if (!fallbackVariant) {
        fallbackVariant = variants[0] ?? null;
      }

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
    const options: { id: string; title: string }[] = [];

    for (const variant of availableRoomVariants.value) {
      const bedTitle = variant.bed?.title?.trim();
      if (!bedTitle || seenTitles.has(bedTitle)) continue;

      seenTitles.add(bedTitle);
      options.push({
        id: variant.room_type_code || String(options.length),
        title: bedTitle,
      });
    }

    return options;
  });

  const currentRoom = computed<Room>(() => {
    const variants = availableRoomVariants.value;

    // Сначала пытаемся найти по выбранному типу кровати
    const selectedVariant = findVariantByCode(variants, selectedBedType.value);
    if (selectedVariant) return selectedVariant;

    // Затем ищем вариант с кроватью
    const variantWithBed = findVariantWithBed(variants);
    if (variantWithBed) return variantWithBed;

    // Возвращаем первый вариант или исходную комнату
    return variants[0] ?? props.room;
  });

  const { carouselImages } = useRoomCarousel(
    computed(() => currentRoom.value.photos || []),
    CAROUSEL_MIN_PHOTOS,
    CAROUSEL_TARGET_ITEMS,
    CAROUSEL_PLACEHOLDER_LABEL,
  );

  const handleTariff = async () => {
    if (!isValidDateRange.value) {
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
          :disabled="loading || !isValidDateRange"
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
    align-items: flex-start;

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
    display: grid;
    place-items: center;
    flex: none;
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
