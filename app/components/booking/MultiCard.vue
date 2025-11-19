<script setup lang="ts">
  // @ts-nocheck - Vue автоматически преобразует kebab-case в camelCase в шаблонах
  import type { Room, RoomTariff, PackageResource } from "~/types/room";
  import { formatCount } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";

  interface Props {
    room: Room;
    services?: PackageResource[];
    selectedCodes?: Record<number, string>;
    roomCardIdx?: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-service-popup", ev: MouseEvent, service: PackageResource): void;
    (
      e: "select-tariff",
      ratePlanCode: string,
      roomIdx: number,
      roomCardIdx?: number,
    ): void;
  }>();

  const bookingStore = useBookingStore();
  const { guests, date } = storeToRefs(bookingStore);

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
    emit("select-tariff", tariff.rate_plan_code, index, props.roomCardIdx);
  }

  // Локальное состояние выбранных тарифов в рамках текущей карточки комнаты
  const selectedTariffsByRoomIdx = ref<Record<number, RoomTariff>>({});

  function onSelectTariff(index: number, tariff: RoomTariff | null) {
    if (!tariff) return;
    const alreadySelectedCode =
      props.selectedCodes?.[index] ??
      selectedTariffsByRoomIdx.value[index]?.rate_plan_code;

    if (alreadySelectedCode === tariff.rate_plan_code) {
      Reflect.deleteProperty(selectedTariffsByRoomIdx.value, index);
      emit("select-tariff", "", index, props.roomCardIdx);
    } else {
      selectTariffFor(index, tariff);
      selectedTariffsByRoomIdx.value[index] = tariff;
    }
  }

  function isSelected(index: number, tariff: RoomTariff | null) {
    if (!tariff) return false;
    const externalCode = props.selectedCodes?.[index];
    if (externalCode) return externalCode === tariff.rate_plan_code;
    return (
      selectedTariffsByRoomIdx.value[index]?.rate_plan_code ===
      tariff.rate_plan_code
    );
  }

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  const nights = useNights(date);
  const calculateNights = (): number => nights.value;

  const getRoomGuests = (
    roomIdx: number,
  ): { adults: number; children: number; childrenAges: number[] } => {
    const roomList = guests.value?.roomList || [];
    if (roomIdx >= 0 && roomIdx < roomList.length) {
      const room = roomList[roomIdx];
      if (room) {
        return room;
      }
    }
    return { adults: 0, children: 0, childrenAges: [] };
  };

  const getTotalPrice = (pricePerNight: number | null | undefined): number => {
    const price = pricePerNight || 0;
    const nights = calculateNights();
    return price * nights;
  };

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
              <BookingInfoButtonWithPopover
                :popover-id="tar.rate_plan_code"
                size="small"
                :aria-label="`Информация о тарифе ${tar.title}`"
              >
                <BookingTariffPopoverContent />
              </BookingInfoButtonWithPopover>
            </div>

            <div :class="$style.confirmList">
              <div
                v-for="idx in roomsCount"
                :key="idx"
                :class="$style.confirmItem"
              >
                <div :class="$style.confirmLeft">
                  <div :class="$style.confirmText">
                    <div :class="$style.confirmTitle">Номер {{ idx }}</div>
                    <div :class="$style.confirmPrice">{{ tar.price }} ₽</div>
                  </div>
                  <BookingInfoButtonWithPopover
                    :popover-id="`${idx - 1}-${tar.rate_plan_code}`"
                    size="small"
                    :aria-label="`Детализация цены для номера ${idx}`"
                    popover-class="pricePopover"
                    popover-padding="16px"
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
                            {{
                              formatCount(
                                getRoomGuests(idx - 1).adults,
                                "person",
                              )
                            }}
                            на основном месте -
                            {{ tar.price?.toLocaleString("ru-RU") || 0 }} ₽ за
                            ночь
                          </div>
                          <div
                            v-if="getRoomGuests(idx - 1).children > 0"
                            :class="$style.guestDetailItem"
                          >
                            {{
                              formatCount(
                                getRoomGuests(idx - 1).children,
                                "person",
                              )
                            }}
                            на дополнительном месте - бесплатно
                          </div>
                        </div>
                      </div>
                      <div :class="$style.priceDetailsDivider" />
                      <div :class="$style.priceDetailsTotal">
                        <span>Стоимость номера за весь период проживания</span>
                        <span :class="$style.priceDetailsTotalAmount">
                          {{ getTotalPrice(tar.price).toLocaleString("ru-RU") }}
                          ₽
                        </span>
                      </div>
                    </div>
                  </BookingInfoButtonWithPopover>
                </div>
                <div :class="$style.confirmActions">
                  <Button
                    type="button"
                    unstyled
                    :class="[
                      $style.selectButton,
                      isSelected(idx - 1, tar) && $style.selectButtonActive,
                    ]"
                    @click="onSelectTariff(idx - 1, tar)"
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
            <span :class="$style.allTariffsIconWrap">
              <UIcon
                name="i-heroicons-chevron-down-20-solid"
                :class="[
                  $style.allTariffsChevron,
                  showAllTariffs && $style.allTariffsChevronRotated,
                ]"
              />
            </span>
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

  .chevronIcon {
    width: rem(28);
    height: rem(28);
    color: var(--a-black);
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
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
    padding: rem(12) 0;
  }

  .confirmLeft {
    display: flex;
    align-items: flex-end;
    gap: rem(12);
    flex: 1;
  }

  .confirmText {
    display: flex;
    flex-direction: column;
  }

  .confirmTitle {
    font-family: Inter, sans-serif;
    font-size: rem(12);
    color: var(--a-text-accent);
  }

  .confirmPrice {
    font-family: Lora, serif;
    font-size: rem(22);
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

  .selectButton {
    padding: rem(8) rem(14);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
  }

  .selectButtonActive {
    background-color: var(--a-btnAccentBg);
  }

  .allTariffs {
    display: flex;
    justify-content: center;
    margin-top: rem(6);
  }

  .allTariffsBtn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: rem(8);
    min-width: rem(250);
    margin: 0 auto;
    padding-right: rem(40);
    background-color: var(--a-btnAccentBg);

    &:hover {
      background-color: var(--a-blackBg);
    }
  }

  .allTariffsIconWrap {
    position: absolute;
    right: rem(20);
    top: 50%;
    transform: translateY(-50%);
    width: rem(24);
    height: rem(24);
    border-radius: 50%;
    border: rem(1) solid var(--a-white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .allTariffsChevron {
    width: rem(16);
    height: rem(16);
    color: var(--a-white);
    transition: transform 0.2s ease;
  }

  .allTariffsChevronRotated {
    transform: rotate(180deg);
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

  /* Блок сводки бронирования */
  .bookingSummary {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    background: var(--a-whiteBg);
    box-shadow: 0 0 rem(10) rgb(0 0 0 / 10%);
    border-radius: var(--a-borderR--card) var(--a-borderR--card) 0 0;
    padding: rem(12) rem(16) rem(16);
  }

  .bookingSummaryVisible {
    display: block;
  }

  .bookingSummaryInner {
    display: flex;
    flex-direction: column;
    gap: rem(10);
  }

  .bookingSummaryHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .bookingSummaryTitle {
    font-family: Lora, serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .bookingSummaryDates {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
  }

  .bookingSummaryContent {
    display: block;
  }

  .bookingSummaryContentCollapsed {
    display: none;
  }

  .bookingSummaryItem {
    display: flex;
    flex-direction: column;
    gap: rem(6);
    padding: rem(8) 0;
  }

  .bookingSummaryItemHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bookingSummaryItemTitle {
    font-family: Inter, sans-serif;
    font-size: rem(12);
    color: var(--a-text-accent);
  }

  .bookingSummaryItemPrice {
    font-family: Lora, serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .bookingSummaryItemBody {
    display: flex;
    flex-direction: column;
    gap: rem(6);
  }

  .bookingSummaryRoomName,
  .bookingSummaryTariff,
  .bookingSummaryGuests,
  .bookingSummarySubtotal {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .bookingSummaryDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-black);
    opacity: 0.1;
    margin: rem(8) 0;
  }

  .bookingSummaryFooter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .bookingSummaryTotal {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-family: Inter, sans-serif;
    font-size: rem(16);
  }

  .continueButton {
    padding: rem(10) rem(16);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
  }

  @media (min-width: #{size.$desktopMin}) {
    // На десктопе мобильная сводка скрыта, т.к. общая сводка будет в правой колонке страницы
    .bookingSummary {
      display: none;
    }

    .bookingSummaryHeader Button {
      display: none; // на десктопе иконка скрывается
    }

    .bookingSummaryContentCollapsed {
      display: block; // не влияет, т.к. блок скрыт
    }
  }
</style>
