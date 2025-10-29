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
  const { guests } = storeToRefs(bookingStore);

  const isPopupOpen = ref(false);
  const showAllTariffs = ref(false);

  const primaryTariff = computed<RoomTariff | null>(() => {
    return props.room.tariffs?.[0] ?? null;
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
    emit("select-tariff", tariff.rate_plan_code, index);
  }
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
        <div v-if="primaryTariff" :class="$style.tariffRow">
          <div v-if="services?.length" :class="$style.services">
            <BookingServicesList
              :services="services"
              :is-service-popup-open="false"
              @open-service-popup="handleOpenService"
            />
          </div>

          <div :class="$style.confirmList">
            <div
              v-for="idx in roomsCount"
              :key="idx"
              :class="$style.confirmItem"
            >
              <div :class="$style.confirmLeft">
                <div :class="$style.confirmTitle">Номер {{ idx }}</div>
                <div :class="$style.confirmPrice">
                  {{ primaryTariff.price }} ₽
                </div>
              </div>
              <div :class="$style.confirmActions">
                <Button
                  type="button"
                  unstyled
                  :class="$style.detailsButton"
                  :aria-label="`Детализация цены для номера ${idx}`"
                  >i</Button
                >
                <Popover :pt="{ content: { style: 'padding: 12px;' } }">
                  <div :class="$style.detailsPopup">
                    <div :class="$style.detailsRow">
                      <span>Тариф:</span>
                      <span>{{ primaryTariff.title }}</span>
                    </div>
                    <div :class="$style.detailsRow">
                      <span>Стоимость:</span>
                      <span>{{ primaryTariff.price }} ₽</span>
                    </div>
                  </div>
                </Popover>

                <Button
                  type="button"
                  unstyled
                  :class="$style.selectButton"
                  @click="selectTariffFor(idx - 1, primaryTariff)"
                  >Выбрать</Button
                >
              </div>
            </div>
          </div>

          <div v-if="room.tariffs?.length > 1" :class="$style.allTariffs">
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

        <div v-if="showAllTariffs" :class="$style.tariffsList">
          <div
            v-for="tar in room.tariffs"
            :key="tar.rate_plan_code"
            :class="$style.otherTariff"
          >
            <div :class="$style.otherTariffInfo">
              <span :class="$style.tariffName">{{ tar.title }}</span>
              <span :class="$style.tariffPrice">{{ tar.price }} ₽</span>
            </div>
            <Button
              type="button"
              unstyled
              :class="$style.selectButton"
              @click="selectTariffFor(0, tar)"
              >Выбрать</Button
            >
          </div>
        </div>
      </div>
    </main>
    <BookingRoomPopup :room="room" :is-open="isPopupOpen" @close="closePopup" />
  </section>
</template>

<style module lang="scss">
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
    font-family: Inter, sans-serif;
    font-size: rem(16);
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
    gap: rem(12);
    align-items: baseline;
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
    border-radius: rem(8);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
  }
</style>
