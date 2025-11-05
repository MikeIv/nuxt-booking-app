<script setup lang="ts">
  import type { Room, RoomTariff, PackageResource } from "~/types/room";
  import { formatCount } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";

  interface Props {
    room: Room;
    services?: PackageResource[];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-service-popup", ev: MouseEvent, service: PackageResource): void;
    (e: "select-tariff", ratePlanCode: string, roomIdx: number): void;
  }>();

  const bookingStore = useBookingStore();
  const { guests, roomTariffs, date } = storeToRefs(bookingStore);

  console.log("roomTariffs", roomTariffs.value);

  const isPopupOpen = ref(false);
  const showAllTariffs = ref(false);

  const sortedTariffs = computed<RoomTariff[]>(() => {
    const tariffs = props.room.tariffs || [];
    return [...tariffs].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  });

  const cheapestTariff = computed<RoomTariff | null>(() => {
    return sortedTariffs.value[0] ?? null;
  });

  const visibleTariffs = computed<RoomTariff[]>(() => {
    if (showAllTariffs.value) return sortedTariffs.value;
    return cheapestTariff.value ? [cheapestTariff.value] : [];
  });

  const roomsCount = computed(() => {
    return guests.value?.roomList
      ? guests.value.roomList.length
      : guests.value?.rooms || 1;
  });

  const expanded = ref(false);
  const visibleAmenities = computed(() => {
    console.log("room", props.room);
    const amenities = props.room.amenities || [];
    return expanded.value ? amenities : amenities.slice(0, 4);
  });

  const _toggleExpand = () => {
    expanded.value = true;
  };

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  function handleOpenService(ev: MouseEvent, service: PackageResource) {
    emit("open-service-popup", ev, service);
  }

  function selectTariffFor(index: number, tariff: RoomTariff | null) {
    if (!tariff) return;
    emit("select-tariff", tariff.rate_plan_code, index);
  }

  // Popover по образцу PrimeVue: держим рефы по коду тарифа и дергаем toggle(event)
  interface PopoverLike {
    toggle: (event: MouseEvent) => void;
    hide?: () => void;
  }
  const tariffPopovers = ref<Record<string, PopoverLike | undefined>>({});

  function setTariffPopoverRef(el: unknown, code: string) {
    if (el) {
      tariffPopovers.value[code] = el as PopoverLike;
    }
  }

  function toggleTariffInfo(event: MouseEvent, code: string) {
    const instance = tariffPopovers.value[code];
    if (instance && typeof instance.toggle === "function") {
      instance.toggle(event);
    }
  }

  // Popover для детализации цены
  const pricePopovers = ref<Record<string, PopoverLike | undefined>>({});

  function setPricePopoverRef(el: unknown, key: string) {
    if (el) {
      pricePopovers.value[key] = el as PopoverLike;
    }
  }

  function togglePriceInfo(event: MouseEvent, roomIdx: number, tariffCode: string) {
    const key = `${roomIdx}-${tariffCode}`;
    const instance = pricePopovers.value[key];
    if (instance && typeof instance.toggle === "function") {
      instance.toggle(event);
    }
  }

  // Форматирование даты для отображения
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  // Вычисление количества ночей
  const calculateNights = (): number => {
    if (!date.value || date.value.length < 2) return 0;
    const start = new Date(date.value[0]);
    const end = new Date(date.value[1]);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Получение информации о гостях для номера
  const getRoomGuests = (roomIdx: number): { adults: number; children: number; childrenAges: number[] } => {
    const roomList = guests.value?.roomList || [];
    if (roomIdx >= 0 && roomIdx < roomList.length) {
      const room = roomList[roomIdx];
      if (room) {
        return room;
      }
    }
    return { adults: 0, children: 0, childrenAges: [] };
  };

  // Вычисление итоговой стоимости (цена за ночь * количество ночей)
  const getTotalPrice = (pricePerNight: number | null | undefined): number => {
    const price = pricePerNight || 0;
    const nights = calculateNights();
    return price * nights;
  };

  // Computed для дат (для использования в шаблоне)
  const checkInDate = computed(() => date.value?.[0] || null);
  const checkOutDate = computed(() => date.value?.[1] || null);
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
      <div :class="$style.wrapperInfoBlock">
        <div :class="$style.roomInfo">
          <span :class="$style.title">{{ room.title }}</span>
          <Button
            unstyled
            :class="$style.infoButton"
            data-popup-button
            @click="openPopup($event)"
          >
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              :class="$style.chevronIcon"
            />
          </Button>
        </div>

        <div :class="$style.description">
          <div :class="$style.item">
            <UIcon name="i-persons" :class="$style.icon" />
            <span :class="$style.itemTitle"
              >До {{ formatCount(room.max_occupancy, "capacity") }}</span
            >
          </div>
          <div :class="$style.item">
            <UIcon name="i-square" :class="$style.icon" />
            <span :class="$style.itemTitle">{{ room.square }} м²</span>
          </div>
          <div :class="$style.item">
            <UIcon name="i-dash-square" :class="$style.icon" />
            <span :class="$style.itemTitle">{{
              formatCount(room.rooms, "chamber")
            }}</span>
          </div>
        </div>
      </div>

      <div :class="$style.amenitiesSection">
        <ul :class="$style.amenitiesList">
          <li
            v-for="(amenity, index) in visibleAmenities"
            :key="index"
            :class="$style.amenityItem"
          >
            <span>{{ amenity.title }}</span>
          </li>
          <button
            v-if="!expanded && (room.amenities?.length || 0) > 4"
            :class="$style.amenitiesListShow"
            @click="_toggleExpand"
          >
            + ещё {{ (room.amenities?.length || 0) - 4 }}
          </button>
        </ul>
      </div>

      <div :class="$style.tariffBlock">
        <div v-if="services?.length" :class="$style.services">
          <BookingServicesList
            :services="services"
            :is-service-popup-open="false"
            @open-service-popup="handleOpenService"
          />
        </div>

        <section v-if="visibleTariffs.length" :class="$style.tariffsList">
          <div v-for="tar in visibleTariffs" :key="tar.rate_plan_code">
            <div :class="$style.otherTariffInfo">
              <span :class="$style.tariffName">{{ tar.title }}</span>
              <Button
                unstyled
                :class="$style.smallInfoButton"
                :aria-label="`Информация о тарифе ${tar.title}`"
                type="button"
                @click="(e) => toggleTariffInfo(e, tar.rate_plan_code)"
              >
                <UIcon
                  name="i-heroicons-chevron-down-20-solid"
                  :class="$style.chevronIcon"
                />
              </Button>
              <Popover
                :ref="(el) => setTariffPopoverRef(el, tar.rate_plan_code)"
                append-to="body"
                class="tariffPopover"
                :pt="{ content: { style: 'padding: 12px;' } }"
              >
                <div :class="$style.detailsPopup">
                  <div :class="$style.detailsRow">Краткое описание тарифа.</div>
                  <div :class="$style.detailsRow">
                    Условия и ограничения применяются.
                  </div>
                  <div :class="$style.detailsRow">
                    Подробности уточняйте при бронировании.
                  </div>
                </div>
              </Popover>
            </div>

            <div :class="$style.confirmList">
              <div
                v-for="idx in roomsCount"
                :key="idx"
                :class="$style.confirmItem"
              >
                <div :class="$style.confirmLeft">
                  <div :class="$style.confirmTitle">Номер {{ idx }}</div>
                  <div :class="$style.confirmPrice">{{ tar.price }} ₽</div>
                </div>
                <div :class="$style.confirmActions">
                  <Button
                    type="button"
                    unstyled
                    :class="$style.smallInfoButton"
                    :aria-label="`Детализация цены для номера ${idx}`"
                    @click="(e) => togglePriceInfo(e, idx - 1, tar.rate_plan_code)"
                  >
                    <UIcon
                      name="i-heroicons-chevron-down-20-solid"
                      :class="$style.chevronIcon"
                    />
                  </Button>
                  <Popover
                    :ref="(el) => setPricePopoverRef(el, `${idx - 1}-${tar.rate_plan_code}`)"
                    append-to="body"
                    class="pricePopover"
                    :pt="{ content: { style: 'padding: 16px;' } }"
                  >
                    <div :class="$style.priceDetailsPopup">
                      <div :class="$style.priceDetailsTitle">
                        Детализация цены, ₽
                      </div>
                      <div :class="$style.priceDetailsDates">
                        {{ formatDateDisplay(checkInDate) }} - 
                        {{ formatDateDisplay(checkOutDate) }}, 
                        {{ formatCount(calculateNights(), "night") }}
                      </div>
                      <div :class="$style.priceDetailsGuests">
                        <div :class="$style.guestDetailRow">
                          <div
                            v-if="getRoomGuests(idx - 1).adults > 0"
                            :class="$style.guestDetailItem"
                          >
                            {{ formatCount(getRoomGuests(idx - 1).adults, "person") }} на основном месте - 
                            {{ tar.price?.toLocaleString("ru-RU") || 0 }} ₽ за ночь
                          </div>
                          <div
                            v-if="getRoomGuests(idx - 1).children > 0"
                            :class="$style.guestDetailItem"
                          >
                            {{ formatCount(getRoomGuests(idx - 1).children, "person") }} на дополнительном месте - 
                            бесплатно
                          </div>
                        </div>
                      </div>
                      <div :class="$style.priceDetailsDivider"/>
                      <div :class="$style.priceDetailsTotal">
                        <span>Стоимость номера за весь период проживания</span>
                        <span :class="$style.priceDetailsTotalAmount">
                          {{ getTotalPrice(tar.price).toLocaleString("ru-RU") }} ₽
                        </span>
                      </div>
                    </div>
                  </Popover>

                  <Button
                    type="button"
                    unstyled
                    :class="$style.selectButton"
                    @click="selectTariffFor(idx - 1, tar)"
                    >Выбрать</Button
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <div v-if="(room.tariffs?.length || 0) > 1" :class="$style.allTariffs">
          <Button
            unstyled
            class="btn__bs"
            :class="$style.allTariffsBtn"
            @click="showAllTariffs = !showAllTariffs"
          >
            {{ showAllTariffs ? "Скрыть тарифы" : "Все тарифы" }}
          </Button>
        </div>
      </div>
    </main>
    <BookingRoomPopup :room="room" :is-open="isPopupOpen" @close="closePopup" />
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: rem(18) rem(14);
    box-shadow: 0 0 rem(10) rgb(0 0 0 / 10%);
    border-radius: var(--a-borderR--card);
    overflow: hidden;
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

  .wrapperInfoBlock {
    flex: 1;
    display: flex;
    flex-direction: column;
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
    font-family: Lora, serif;
    font-size: rem(22);
    font-weight: bold;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }
  }

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: rem(32);
    height: rem(32);
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .smallInfoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: rem(24);
    height: rem(24);
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .chevronIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-black);
  }

  .description {
    display: flex;
    flex-wrap: wrap;
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
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .tariffBlock {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-top: rem(20);
    padding: 0 rem(16) rem(8);
  }

  .tariffTitle {
    font-family: Lora, serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .tariffRow {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  .tariffMain {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tariffName {
    font-family: Lora, serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .tariffPrice {
    font-family: Lora, serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .services {
    margin-top: rem(8);
  }

  .confirmList {
    display: flex;
    flex-direction: column;
    gap: rem(10);
    margin-top: rem(4);
  }

  .confirmItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(12);
  }

  .confirmLeft {
    display: flex;
    flex-direction: column;
  }

  .confirmTitle {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .confirmPrice {
    font-family: Lora, serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .confirmActions {
    display: flex;
    align-items: center;
    gap: rem(10);
  }

  .detailsButton {
    width: rem(32);
    height: rem(32);
    border-radius: 50%;
    background-color: var(--a-accentLightBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .detailsPopup {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    min-width: rem(220);
  }

  .detailsRow {
    display: flex;
    justify-content: space-between;
    gap: rem(10);
    font-family: Inter, sans-serif;
    font-size: rem(14);
  }

  .selectButton {
    padding: rem(8) rem(14);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
  }

  .allTariffs {
    display: flex;
    justify-content: center;
    margin-top: rem(6);
  }

  .allTariffsBtn {
    margin: 0 auto;
    background-color: var(--a-btnAccentBg);

    &:hover {
      background-color: var(--a-blackBg);
    }
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    margin-top: rem(10);
  }

  .otherTariff {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(10) rem(12);
    border: 1px solid var(--a-border-primary);
    border-radius: var(--a-borderR--card);
  }

  .otherTariffInfo {
    display: flex;
    align-items: center;
    gap: rem(12);
    margin-bottom: rem(20);
  }

  .amenitiesSection {
    margin: rem(20) 0 0 0;
    padding: 0 rem(16) rem(20);
    border-bottom: 1px solid var(--a-border-primary);
  }

  .amenitiesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .amenitiesListShow {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-light);
    cursor: pointer;

    &:hover {
      color: var(--a-text-primary);
    }
  }

  .amenityItem {
    display: flex;
    align-items: center;
    padding: rem(2) rem(14);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--dialog);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
  }

  .priceDetailsPopup {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    min-width: rem(280);
  }

  .priceDetailsTitle {
    font-family: Lora, serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(4);
  }

  .priceDetailsDates {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
    margin-bottom: rem(4);
  }

  .priceDetailsGuests {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    margin-top: rem(8);
  }

  .guestDetailRow {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .guestDetailItem {
    font-family: Inter, sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    line-height: 1.5;
  }

  .priceDetailsDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-primary);
    margin: rem(8) 0;
  }

  .priceDetailsTotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(12);
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .priceDetailsTotalAmount {
    font-weight: 600;
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  :global {
    .p-popover:before {
      left: 20px !important;
    }

    .tariffPopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }

    .pricePopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }
  }
</style>
