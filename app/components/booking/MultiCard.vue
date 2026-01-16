<script setup lang="ts">
  import type { Room, RoomTariff, PackageResource } from "~/types/room";
  import { formatCount } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";

  interface Props {
    room: Room;
    services?: PackageResource[];
    selectedCodes?: Record<string, string>;
    roomCardIdx?: number;
    isAllRoomsSelected?: boolean;
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

  const hasTariffs = computed(() => {
    return (props.room.tariffs?.length || 0) > 0;
  });

  // Отладочная информация (только в dev режиме)
  if (import.meta?.env?.DEV) {
    watch(
      () => [props.room.tariffs, visibleTariffs.value, hasTariffs.value],
      ([tariffs, visible, has]) => {
        console.log("MultiCard tariffs debug:", {
          roomTitle: props.room.title,
          tariffsCount: (tariffs as RoomTariff[] | undefined)?.length || 0,
          visibleCount: (visible as RoomTariff[])?.length || 0,
          hasTariffs: has as boolean,
          showAllTariffs: showAllTariffs.value,
        });
      },
      { immediate: true },
    );
  }

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
    // Используем составной ключ для уникальной идентификации номера в конкретной карточке
    const key = props.roomCardIdx !== undefined 
      ? `${props.roomCardIdx}-${index}` 
      : `${index}`;
    const alreadySelectedCode =
      props.selectedCodes?.[key] ??
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
    // Используем составной ключ для уникальной идентификации номера в конкретной карточке
    const key = props.roomCardIdx !== undefined 
      ? `${props.roomCardIdx}-${index}` 
      : `${index}`;
    const externalCode = props.selectedCodes?.[key];
    if (externalCode) return externalCode === tariff.rate_plan_code;
    return (
      selectedTariffsByRoomIdx.value[index]?.rate_plan_code ===
      tariff.rate_plan_code
    );
  }

  function isButtonDisabled(index: number, tariff: RoomTariff | null) {
    if (!tariff) return true;
    // Если все номера выбраны и текущий номер не выбран, блокируем кнопку
    if (props.isAllRoomsSelected && !isSelected(index, tariff)) {
      return true;
    }
    return false;
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
  <article :class="$style.card">
    <div :class="$style.cardContent">
      <div :class="$style.topSection">
        <header :class="$style.carouselWrapper">
          <BookingCarousel
            :images="room.photos || []"
            :alt-prefix="'Фото номера'"
            :alt-text="room.title"
            height="326px"
          />
        </header>

        <main :class="$style.cardDetails">
          <div :class="$style.cardDetailsTop">
            <div :class="$style.wrapperInfoBlock">
              <div :class="$style.roomInfo">
                <h2 :class="$style.title">{{ room.title }}</h2>
                <button
                  type="button"
                  :class="$style.infoButton"
                  data-popup-button
                  ariaLabel="Подробнее о номере"
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
                    До {{ formatCount(room.max_occupancy, "capacity") }}
                  </dd>
                </div>
                <div :class="$style.item">
                  <dt :class="$style.itemTerm">
                    <UIcon name="i-square" :class="$style.icon" aria-hidden="true" />
                  </dt>
                  <dd :class="$style.itemTitle">{{ room.square }} м²</dd>
                </div>
                <div :class="$style.item">
                  <dt :class="$style.itemTerm">
                    <UIcon name="i-dash-square" :class="$style.icon" aria-hidden="true" />
                  </dt>
                  <dd :class="$style.itemTitle">{{
                    formatCount(room.rooms, "chamber")
                  }}</dd>
                </div>
              </dl>
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
                <li
                  v-if="!expanded && (room.amenities?.length || 0) > 4"
                  :class="$style.amenitiesListItem"
                >
                  <button
                    type="button"
                    :class="$style.amenitiesListShow"
                    @click="_toggleExpand"
                  >
                    + ещё {{ (room.amenities?.length || 0) - 4 }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      <div :class="$style.tariffBlock">
        <div v-if="services?.length" :class="$style.services">
          <BookingServicesList
            :services="services"
            :is-service-popup-open="false"
            @open-service-popup="handleOpenService"
          />
        </div>

        <section v-if="hasTariffs && visibleTariffs.length > 0" :class="$style.tariffsList">
          <article
            v-for="tar in visibleTariffs"
            :key="tar.rate_plan_code"
            :class="$style.tariffRow"
          >
            <div :class="$style.tariffLeftColumn">
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

              <div :class="$style.tariffDetails">
                <div :class="$style.tariffDetailItem">
                  <UIcon
                    name="i-fork-knife"
                    :class="[
                      $style.tariffDetailIcon,
                      { [$style.tariffDetailIconPenalty]: !tar.has_food },
                    ]"
                  />
                  <span :class="$style.tariffDetailText">
                    {{ tar.has_food ? "Питание включено" : "Питание не включено" }}
                  </span>
                </div>
                <div :class="$style.tariffDetailItem">
                  <UIcon
                    name="i-cancellation"
                    :class="[
                      $style.tariffDetailIcon,
                      { [$style.tariffDetailIconPenalty]: !tar.cancellation_free },
                    ]"
                  />
                  <span :class="$style.tariffDetailText">
                    {{ tar.cancellation_free ? "Бесплатная отмена" : "Отмена со штрафом" }}
                  </span>
                  <BookingInfoButtonWithPopover
                    v-if="tar.cancellation_free"
                    :popover-id="`cancellation-${tar.rate_plan_code}`"
                    size="small"
                    :aria-label="`Информация об отмене тарифа ${tar.title}`"
                  >
                    <BookingCancellationPopoverContent
                      :title="tar.cancellation_popover?.title"
                      :description="tar.cancellation_popover?.description"
                    />
                  </BookingInfoButtonWithPopover>
                </div>
                <div v-if="tar.payment_types && tar.payment_types.length > 0" :class="$style.tariffDetailItem">
                  <UIcon name="i-payment" :class="$style.tariffDetailIcon" />
                  <span :class="$style.tariffDetailText">
                    {{ tar.payment_types.join(", ") }}
                  </span>
                </div>
              </div>
            </div>

            <div :class="$style.confirmList">
              <div :class="$style.averagePriceSection">
                <span :class="$style.averagePriceLabel">Средняя стоимость за 1 ночь</span>
              </div>
              <div
                v-for="idx in roomsCount"
                :key="idx"
                :class="$style.confirmItem"
              >
                <div :class="$style.confirmLeft">
                  <div :class="$style.confirmText">
                    <div :class="$style.confirmTitle">Номер {{ idx }}</div>
                    <div :class="$style.confirmPriceWrapper">
                      <div :class="$style.confirmGuestsIcons">
                        <UIcon
                          v-for="n in getRoomGuests(idx - 1).adults"
                          :key="`adult-${idx}-${n}`"
                          name="i-icon-man"
                          :class="$style.confirmGuestIconAdult"
                          aria-hidden="true"
                        />
                        <UIcon
                          v-if="getRoomGuests(idx - 1).children > 0"
                          name="i-icon-plus-person"
                          :class="$style.confirmGuestIconPlus"
                          aria-hidden="true"
                        />
                        <UIcon
                          v-for="n in getRoomGuests(idx - 1).children"
                          :key="`child-${idx}-${n}`"
                          name="i-icon-child"
                          :class="$style.confirmGuestIconChild"
                          aria-hidden="true"
                        />
                      </div>
                      <div :class="$style.confirmPrice">{{ tar.price?.toLocaleString("ru-RU") || 0 }} ₽</div>
                    </div>
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
                      isButtonDisabled(idx - 1, tar) && $style.selectButtonDisabled,
                    ]"
                    :disabled="isButtonDisabled(idx - 1, tar)"
                    @click="onSelectTariff(idx - 1, tar)"
                    >{{ isSelected(idx - 1, tar) ? "Выбрано" : "Выбрать" }}</Button
                  >
                </div>
              </div>
            </div>
          </article>
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
    </div>
    <BookingRoomPopup :room="room" :is-open="isPopupOpen" @close="closePopup" />
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: 0;
    background: var(--a-whiteBg);
    box-shadow: 4px 4px 30px rgba(0, 0, 0, 0.1);
    border-radius: rem(22);
    overflow: hidden;
  }

  .cardContent {
    display: flex;
    flex-direction: column;
  }

  .topSection {
    display: flex;
    flex-direction: column;

    @media (min-width: 1025px) {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .carouselWrapper {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: 0;
    min-height: rem(202);
    justify-content: center;
    align-items: flex-start;

    @media (min-width: #{size.$tablet}) {
      min-height: rem(281);
    }

    @media (min-width: 1025px) {
      width: rem(557);
      flex-shrink: 0;
      min-height: rem(281);
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: rem(452);
      min-height: rem(281);
    }

    :global(.p-carousel) {
      width: 100%;
    }
  }

  .cardDetails {
    display: flex;
    flex-direction: column;
    width: 100%;

    @media (min-width: 1025px) {
      flex: 1;
      flex-direction: column;
      padding: rem(22) 0 0 rem(22);
    }
  }

  .cardDetailsTop {
    display: flex;
    flex-direction: column;

    @media (min-width: 1025px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
      padding: 0 rem(22) 0 0;
    }
  }

  .wrapperInfoBlock {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(22) rem(22) 0;

    @media (min-width: #{size.$tablet}) {
      padding: rem(22) rem(22) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 0 0 auto;
      padding: 0;
      gap: rem(16);
      min-width: rem(181);
    }
  }

  .roomInfo {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .title {
    font-family: Lora, serif;
    font-size: rem(22);
    font-weight: bold;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
      line-height: 1.2;
    }
  }

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: rem(34);
    height: rem(34);
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-primaryBg);
      border-color: var(--a-primaryBg);
    }

    @media (min-width: #{size.$tablet}) {
      width: rem(40.75);
      height: rem(41);
    }

    @media (min-width: #{size.$desktopMin}) {
      width: rem(32);
      height: rem(32);
    }
  }

  .chevronIcon {
    width: rem(28);
    height: rem(28);
    color: var(--a-black);
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    gap: rem(10);
    margin: 0;
    padding: 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(10);
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(10) rem(25);
    }
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
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
    margin: 0;
  }

  .tariffBlock {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-top: rem(20);
    padding: 0 rem(22) rem(20);

    @media (min-width: #{size.$tablet}) {
      padding: 0 rem(22) rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      margin-top: rem(20);
      padding: rem(22);
      border-top: 1px solid var(--a-border-primary);
    }
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
    gap: rem(20);

    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
      align-items: flex-start;
      gap: rem(40);
    }
  }

  .tariffLeftColumn {
    display: flex;
    flex-direction: column;
    flex: 1;

    @media (min-width: #{size.$desktopMedium}) {
      flex: 1;
    }
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

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
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
    margin-top: rem(4);
    align-items: flex-end;

    @media (min-width: #{size.$desktopMedium}) {
      margin-top: 0;
      flex: 1;
      align-items: flex-end;
    }
  }

  .confirmItem {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: rem(16) 0;
  }

  .confirmLeft {
    display: flex;
    align-items: flex-end;
    gap: rem(12);
    flex: 1;
    margin-right: rem(20);
  }

  .confirmText {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .confirmTitle {
    font-family: Inter, sans-serif;
    font-size: rem(12);
    color: var(--a-text-accent);
  }

  .confirmPriceWrapper {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .confirmGuestsIcons {
    display: flex;
    align-items: center;
  }

  .confirmGuestIconAdult {
    width: rem(14);
    height: rem(20);
    color: var(--a-lightBg);
  }

  .confirmGuestIconChild {
    width: rem(12);
    height: rem(12);
    color: var(--a-lightBg);
  }

  .confirmGuestIconPlus {
    width: rem(8);
    height: rem(8);
    color: var(--a-lightBg);
    margin: 0 rem(2);
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
    padding: rem(8) rem(16);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-btnAccentBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 500;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-blackBg);
    }
  }

  .selectButtonActive {
    background-color: var(--a-blackBg);
    color: var(--a-white);

    &:hover {
      background-color: var(--a-btnAccentBg);
    }
  }

  .selectButtonDisabled {
    background-color: var(--a-border-primary);
    color: var(--a-text-white);
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: var(--a-border-primary);
    }
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
    border-bottom: 1px solid var(--a-border-primary);
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

  .tariffDetails {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    margin-bottom: rem(20);
    padding-bottom: rem(20);
  }

  .tariffDetailItem {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .tariffDetailIcon {
    width: rem(20);
    height: rem(20);
    flex-shrink: 0;
    color: #178b08;
  }

  .tariffDetailIconPenalty {
    color: #9ca3af;
  }

  .tariffDetailText {
    font-family: Inter, sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(18);
    }
  }

  .averagePriceSection {
    margin-bottom: rem(14);
    text-align: left;
  }

  .averagePriceLabel {
    font-family: Inter, sans-serif;
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .amenitiesSection {
    margin: rem(20) 0 0 0;
    padding: 0 rem(22) rem(20);
    border-bottom: 1px solid var(--a-border-primary);

    @media (min-width: #{size.$tablet}) {
      padding: 0 rem(22) rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 1;
      margin: 0;
      padding: 0 0 0 rem(16);
      border-bottom: none;
      align-self: flex-start;
    }
  }

  .amenitiesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(10) rem(16);

    @media (min-width: #{size.$tablet}) {
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(8) rem(16);
      max-width: rem(263);
      align-content: flex-start;
    }

    @media (min-width: #{size.$desktopMedium}) {
      max-width: rem(263);
    }
  }

  .amenitiesListItem {
    list-style: none;
  }

  .amenitiesListShow {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-light);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: color 0.2s ease;

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
      left: 20px;
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
