<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { formatCount } from "~/utils/declension";
  import { useNights } from "~/composables/useNights";
  import { useRoomCarousel } from "~/composables/useRoomCarousel";
  import { useStructuredData } from "~/composables/useStructuredData";
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
  const { generateHotelRoomSchema, setStructuredData } = useStructuredData();

  const CAROUSEL_MIN_PHOTOS = 2;
  const CAROUSEL_TARGET_ITEMS = 3;
  const CAROUSEL_PLACEHOLDER_LABEL = "Room Photo";

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

  const nightsCount = useNights(date);

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const availableRoomVariants = computed<Room[]>(() => {
    const variants = props.room.room_type_codes ?? [];
    console.log(variants);
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
      // Если вариантов нет, сбрасываем выбор
      if (variants.length === 0) {
        selectedBedType.value = null;
        return;
      }

      // Проверяем, существует ли текущий выбранный вариант
      const hasCurrentSelection = variants.some(
        (variant) => variant.room_type_code === selectedBedType.value,
      );

      // Если текущий выбор валиден, ничего не меняем
      if (hasCurrentSelection) {
        return;
      }

      // Ищем fallback вариант
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

      if (fallback) {
        selectedBedType.value = fallback;
      } else {
        selectedBedType.value = null;
      }
    },
    { immediate: true },
  );

  const bedOptions = computed(() => {
    const variants = availableRoomVariants.value;
    if (variants.length === 0) return [];

    // Оптимальный подход: обрабатываем массив вариантов напрямую
    // Это гарантирует актуальность данных и отсутствие рассинхронизации
    const seenBedIds = new Set<number>();
    const seenTitles = new Set<string>();
    const options: { id: string; title: string }[] = [];

    for (const variant of variants) {
      const bed = variant.bed;
      
      // Пропускаем варианты без кровати
      if (!bed?.title?.trim()) continue;
      
      // Пропускаем дубликаты по ID или title
      if (bed.id !== undefined && bed.id !== null) {
        if (seenBedIds.has(bed.id)) continue;
        seenBedIds.add(bed.id);
      } else {
        if (seenTitles.has(bed.title.trim())) continue;
        seenTitles.add(bed.title.trim());
      }

      options.push({
        id: variant.room_type_code || String(options.length),
        title: bed.title.trim(),
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

  // Генерация структурированных данных (JSON-LD) для SEO
  watch(
    [currentRoom, carouselImages],
    ([room, images]) => {
      // Фильтруем только реальные URL изображений (строки), исключая плейсхолдеры
      const imageUrls = images.filter((img): img is string => typeof img === "string");
      const schema = generateHotelRoomSchema(room, imageUrls);
      setStructuredData(schema);
    },
    { immediate: true }
  );

  const formattedMinPrice = computed(() => {
    const price = currentRoom.value.min_price;
    return price !== null && price !== undefined ? `${price} руб.` : null;
  });

  const handleTariff = async () => {
    if (!isValidDateRange.value) {
      console.error("Не выбраны даты бронирования");
      return;
    }

    loading.value = true;

    try {
      const roomData = currentRoom.value;
      const variants = availableRoomVariants.value;
      
      // Критически важно: всегда использовать правильный room_type_code (код, а не название)
      // В ответе сервера room_type_code должен быть сокращенным кодом (например, "DLT")
      let roomTypeCode: string | null = null;
      
      // Если есть варианты (room_type_codes), используем код из варианта
      // Если вариантов нет (плоский формат), используем код из props.room
      if (variants.length > 0 && variants[0] !== props.room) {
        // Есть варианты - используем код из выбранного или первого варианта
        const selectedVariant = roomData !== props.room ? roomData : variants[0];
        
        // Проверяем, что selectedVariant существует и код валидный (не пустой и не равен названию)
        if (selectedVariant && 
            selectedVariant.room_type_code && 
            selectedVariant.room_type_code.trim() !== "" && 
            selectedVariant.room_type_code !== selectedVariant.title) {
          roomTypeCode = selectedVariant.room_type_code;
        } else {
          // Ищем первый вариант с валидным кодом
          const validVariant = variants.find(
            (v) => v.room_type_code && 
                   v.room_type_code.trim() !== "" && 
                   v.room_type_code !== v.title
          );
          roomTypeCode = validVariant?.room_type_code ?? variants[0]?.room_type_code ?? null;
        }
      } else {
        // Нет вариантов (плоский формат) - используем код напрямую из props.room
        // Но проверяем, что это действительно код, а не название
        if (props.room.room_type_code && 
            props.room.room_type_code.trim() !== "" && 
            props.room.room_type_code !== props.room.title) {
          roomTypeCode = props.room.room_type_code;
        } else {
          // Если код равен названию или пустой - это ошибка данных
          if (import.meta?.env?.DEV) {
            console.error("room_type_code равен названию или пустой в props.room", {
              room_type_code: props.room.room_type_code,
              title: props.room.title,
            });
          }
          return;
        }
      }
      
      // Финальная проверка: код не должен быть пустым или равным названию
      if (!roomTypeCode || roomTypeCode.trim() === "" || roomTypeCode === roomData.title) {
        if (import.meta?.env?.DEV) {
          console.error("Не удалось определить валидный код типа номера", {
            roomTypeCode,
            roomData: {
              room_type_code: roomData.room_type_code,
              title: roomData.title,
            },
            propsRoom: {
              room_type_code: props.room.room_type_code,
              title: props.room.title,
            },
            variants: variants.map(v => ({
              room_type_code: v.room_type_code,
              title: v.title,
            })),
            selectedBedType: selectedBedType.value
          });
        }
        return;
      }
      
      bookingStore.setSelectedRoomType(roomTypeCode);

      const roomsCount = guests.value?.roomList
        ? guests.value.roomList.length
        : guests.value?.rooms || 1;

      const target = roomsCount > 1 ? "/multi-rooms" : "/rooms/tariff";
      await router.push(target);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <article :class="$style.card">
    <header :class="$style.carouselWrapper">
      <BookingCarousel
        :images="carouselImages"
        :alt-prefix="'Фото номера'"
        :alt-text="currentRoom.title"
        height="326px"
      />
    </header>

    <div :class="$style.cardDetails">
      <div :class="$style.wrapperInfoBlock">
        <div :class="$style.roomInfo">
          <h2 :class="$style.title">{{ currentRoom.title }}</h2>

          <button
            :class="$style.infoButton"
            data-popup-button
            aria-label="Подробнее о номере"
            @click="openPopup($event)"
          >
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              :class="$style.chevronIcon"
              aria-hidden="true"
            />
          </button>
        </div>

        <dl :class="$style.description">
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-persons" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">
              До {{ formatCount(currentRoom.max_occupancy, "capacity") }}
            </dd>
          </div>
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-square" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">
              {{ currentRoom.square }} м²
            </dd>
          </div>
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon
                name="i-dash-square"
                :class="$style.icon"
                aria-hidden="true"
              />
            </dt>
            <dd :class="$style.itemTitle">
              {{ formatCount(currentRoom.rooms, "chamber") }}
            </dd>
          </div>
        </dl>

        <div :class="$style.priceBlock">
          <p :class="$style.guestGift">
            <UIcon name="i-gift-line" :class="$style.icon" aria-hidden="true" />
            За регистрацию {{ currentRoom.price_for_register }} ₽
          </p>
          <p
            v-if="currentRoom.min_price !== null && currentRoom.min_price !== undefined"
            :class="$style.price"
          >
            От {{ formattedMinPrice }}
          </p>
          <p :class="$style.guestInfo">
            {{ formatCount(totalAdults, "guest") }} /
            {{ formatCount(nightsCount, "night") }}
          </p>
        </div>
      </div>

      <footer :class="$style.footer">
        <div :class="$style.bedSelect">
          <label :class="$style.bedSelectLabel" for="bed-type-select">
            Тип кровати:
          </label>
          <Select
            id="bed-type-select"
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
          <span :class="$style.buttonText">Выбрать номер</span>
          <ProgressSpinner
            v-show="loading"
            :class="$style.buttonSpinner"
            style="width: 16px; height: 16px"
            stroke-width="3"
            fill="transparent"
            animation-duration="1s"
            aria-label="Загрузка"
          />
        </Button>
      </footer>
    </div>

    <BookingRoomPopup
      :room="currentRoom"
      :is-open="isPopupOpen"
      @close="closePopup"
    />
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

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
    margin: 0;
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
    margin: 0;
    padding: 0;
  }

  .item {
    display: flex;
    gap: rem(8);
    align-items: center;
    margin-bottom: rem(8);
  }

  .itemTerm {
    display: flex;
    align-items: center;
    margin: 0;
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
    margin: 0;
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
    cursor: pointer;
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
    margin: 0 0 rem(4) 0;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .guestGift {
    display: flex;
    align-items: center;
    gap: rem(4);
    margin: 0;
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
    position: relative;
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

  .buttonText {
    position: relative;
    z-index: z.z("default");
  }

  .buttonSpinner {
    position: absolute;
    right: rem(16);
    top: 50%;
    transform: translateY(-50%);
    z-index: z.z("behind");
    pointer-events: none;
  }
</style>
