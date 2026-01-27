<script setup lang="ts">
  import { computed, ref, toRefs, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { formatCount } from "~/utils/declension";
  import type { DeclensionRules } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";

  interface SelectedEntry {
    roomIdx: number;
    roomCardIdx: number;
    roomTitle: string;
    room_type_code: string;
    ratePlanCode: string;
    price: number | null | undefined;
    title: string;
  }

  interface Props {
    selectedEntries: Record<string, SelectedEntry>;
    date: [Date, Date] | null | undefined;
    nights: number;
    bookingTotal: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "continue"): void;
  }>();

  const { date, nights, selectedEntries, bookingTotal } = toRefs(props);

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  };

  const formatNights = (nights: number): string => {
    if (nights === 1) return "ночь";
    if (nights >= 2 && nights <= 4) return "ночи";
    return "ночей";
  };

  const formatWeekday = (date: Date | null | undefined): string => {
    if (!date) return "";
    const weekday = date.toLocaleDateString("ru-RU", {
      weekday: "long",
    });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  };

  const checkInDate = computed(() => date.value?.[0] ?? null);
  const checkOutDate = computed(() => date.value?.[1] ?? null);

  const checkInFormatted = computed(() => formatDate(checkInDate.value));
  const checkOutFormatted = computed(() => formatDate(checkOutDate.value));

  const checkInWeekday = computed(() => formatWeekday(checkInDate.value));
  const checkOutWeekday = computed(() => formatWeekday(checkOutDate.value));

  const isDatesDetailsOpen = ref(false);

  const toggleDatesDetails = () => {
    isDatesDetailsOpen.value = !isDatesDetailsOpen.value;
  };

  const bookingStore = useBookingStore();
  const { guests, selectedServices } = storeToRefs(bookingStore);

  const expandedRooms = ref<Record<number, boolean>>({});

  const toggleRoomDetails = (roomIdx: number) => {
    expandedRooms.value[roomIdx] = !expandedRooms.value[roomIdx];
  };

  const isRoomExpanded = (roomIdx: number) => {
    return !!expandedRooms.value[roomIdx];
  };

  const ADULT_DECLENSION: DeclensionRules = {
    one: "взрослый",
    few: "взрослых",
    many: "взрослых",
  };

  const CHILD_DECLENSION: DeclensionRules = {
    one: "ребёнок",
    few: "ребёнка",
    many: "детей",
  };

  const roomGuests = computed(
    () => guests.value?.roomList?.map((room) => ({ ...room })) ?? [],
  );

  const roomGuestLines = computed(() => {
    return roomGuests.value.map((room) => {
      if (!room) {
        return [] as string[];
      }

      const lines: string[] = [];

      if (room.adults > 0) {
        lines.push(
          `${formatCount(room.adults, ADULT_DECLENSION)} на основном месте`,
        );
      }

      if (room.children > 0) {
        lines.push(
          `${formatCount(room.children, CHILD_DECLENSION)} на дополнительном месте`,
        );
      }

      return lines;
    });
  });

  const roomEntries = computed(() =>
    Object.values(selectedEntries.value).sort((a, b) => a.roomIdx - b.roomIdx),
  );

  const hasRoomEntries = computed(() => roomEntries.value.length > 0);

  // Используется в шаблоне для условного отображения элементов
  const isSingleRoom = computed(() => roomEntries.value.length === 1);

  // Автоматически раскрываем единственный номер при монтировании
  watch(
    () => roomEntries.value.length,
    (length) => {
      if (length === 1) {
        expandedRooms.value[roomEntries.value[0]?.roomIdx] = true;
      }
    },
    { immediate: true },
  );

  const handleContinue = () => {
    emit("continue");
  };
</script>

<template>
  <aside :class="$style.pageSummary">
    <div :class="$style.pageSummaryInner">
      <div :class="$style.pageSummaryHeader">
        <span :class="$style.pageSummaryTitle">Ваше бронирование</span>
        <div :class="$style.infoButtonWrapper">
          <BookingInfoButton
            :icon-name="
              isDatesDetailsOpen
                ? 'i-heroicons-chevron-up-20-solid'
                : 'i-heroicons-chevron-down-20-solid'
            "
            aria-label="Подробнее о датах проживания"
            :aria-expanded="isDatesDetailsOpen"
            @click="toggleDatesDetails"
          />
        </div>
      </div>
      <div v-if="!isDatesDetailsOpen" :class="$style.pageSummaryDatesMobile">
        {{ formatDate(date?.[0] || null) }} -
        {{ formatDate(date?.[1] || null) }}, {{ nights }}
        {{ formatNights(nights) }}
      </div>
      <div :class="$style.pageSummaryDates">
        {{ formatDate(date?.[0] || null) }} -
        {{ formatDate(date?.[1] || null) }}, {{ nights }}
        {{ formatNights(nights) }}
      </div>
      <div
        :class="[
          $style.pageSummaryDatesDetails,
          isDatesDetailsOpen ? $style.open : undefined,
        ]"
      >
        <div :class="$style.roomInfoBlock">
          <div :class="$style.dateRow">
            <span :class="$style.bookingDetailLabel">{{
              checkInFormatted
            }}</span>
            <UIcon name="i-arrow-long" :class="$style.detailIcon" />
            <span :class="$style.bookingDetailLabel">{{
              checkOutFormatted
            }}</span>
          </div>
          <div :class="$style.weekdayRow">
            <span :class="$style.detailDay">{{ checkInWeekday }}</span>
            <span :class="$style.weekday">{{
              formatCount(nights, "night")
            }}</span>
            <span :class="[$style.detailDay, $style.dayRight]">{{
              checkOutWeekday
            }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasRoomEntries" :class="$style.pageSummaryList">
        <div
          v-for="entry in roomEntries"
          :key="entry.roomIdx + '-' + entry.ratePlanCode"
          :class="$style.pageSummaryItem"
        >
          <!-- Кнопка раскрытия только для мультибронирования -->
          <Button
            v-if="!isSingleRoom"
            type="button"
            :class="$style.roomButton"
            class="btn__bs dark round"
            unstyled
            :aria-expanded="isRoomExpanded(entry.roomIdx)"
            @click="toggleRoomDetails(entry.roomIdx)"
          >
            <span :class="$style.roomButtonText">
              Номер {{ entry.roomIdx + 1 }}
            </span>
            <div :class="$style.roomButtonIconWrapper">
              <UIcon
                name="i-chevron-down"
                :class="[
                  $style.roomButtonIcon,
                  {
                    [$style.roomButtonIconRotated]: isRoomExpanded(entry.roomIdx),
                  },
                ]"
              />
            </div>
          </Button>
          <!-- Детали номера: для одного номера всегда видимы, для нескольких - по раскрытию -->
          <Transition name="fade">
            <div
              v-if="isSingleRoom || isRoomExpanded(entry.roomIdx)"
              :class="$style.roomDetails"
            >
              <div :class="$style.roomDetailsHeader">
                <span :class="$style.roomType">{{ entry.roomTitle }}</span>
                <span :class="$style.roomPrice">
                  {{ (entry.price || 0).toLocaleString("ru-RU") }} ₽/ночь
                </span>
              </div>
              <div :class="$style.roomTariff">{{ entry.title }}</div>
              <div :class="$style.roomDivider" />
              <div
                v-for="(line, idx) in roomGuestLines[entry.roomIdx] || []"
                :key="idx"
                :class="$style.roomGuestLine"
              >
                {{ line }}
              </div>
              <div
                v-if="(roomGuestLines[entry.roomIdx] || []).length > 0"
                :class="$style.roomDivider"
              />
              <!-- Итого за номер показывается только при мультибронировании -->
              <div v-if="!isSingleRoom" :class="$style.roomTotal">
                <span>Итого за Номер {{ entry.roomIdx + 1 }}:</span>
                <strong>
                  {{ ((entry.price || 0) * nights).toLocaleString("ru-RU") }} ₽
                </strong>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div v-if="selectedServices.length > 0" :class="$style.servicesSection">
        <div :class="$style.servicesHeader">Дополнительные услуги:</div>
        <div :class="$style.servicesList">
          <div
            v-for="service in selectedServices"
            :key="service.id"
            :class="$style.serviceItem"
          >
            <span :class="$style.serviceTitle">{{ service.title }}</span>
            <div :class="$style.serviceActions">
              <span :class="$style.servicePrice">
                {{ service.price.toLocaleString("ru-RU") }} ₽
              </span>
              <Button
                type="button"
                unstyled
                :class="$style.removeServiceButton"
                aria-label="Удалить услугу"
                @click="bookingStore.removeService(service.id)"
              >
                <UIcon name="i-close" :class="$style.removeIcon" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div :class="$style.pageSummaryDivider" />
      <div :class="$style.pageSummaryGrandTotal">
        <span>Итого:</span>
        <strong>{{ bookingTotal.toLocaleString("ru-RU") }} ₽</strong>
      </div>
      <div :class="$style.pageSummaryFooter">
        <div :class="$style.pageSummaryTotal">
          <span>Итого</span>
          <strong>{{ bookingTotal.toLocaleString("ru-RU") }} ₽</strong>
        </div>
        <Button
          unstyled
          :class="$style.pageContinueButton"
          @click="handleContinue"
          >Продолжить</Button
        >
      </div>
    </div>
  </aside>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .pageSummary {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: calc(100% - #{rem(40)});
    max-width: 100%;
    margin: 0 rem(20);
    padding: 0;
    background: var(--a-whiteBg);
    box-shadow: 4px 4px 30px rgba(0, 0, 0, 0.1);
    border-radius: rem(40) rem(40) 0 0;
    z-index: z.z("booking-summary");

    @media (min-width: 769px) {
      width: rem(687);
      max-width: rem(687);
      margin-left: auto;
      margin-right: auto;
    }

    @media (min-width: #{size.$desktopMin}) {
      position: static;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-shadow: none;
      border-radius: 0;
      background: transparent;
    }
  }

  .pageSummaryInner {
    background: var(--a-whiteBg);
    box-shadow: none;
    border-radius: rem(40) rem(40) 0 0;
    padding: rem(30) rem(30) rem(16);

    @media (min-width: #{size.$desktopMin}) {
      position: sticky;
      top: rem(20);
      box-shadow: 0 0 rem(10) rgb(0 0 0 / 10%);
      border-radius: var(--a-borderR--card);
      padding: rem(16);
    }
  }

  .pageSummaryHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: rem(8);
  }

  .infoButtonWrapper {
    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  .pageSummaryTitle {
    font-family: Lora, serif;
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .pageSummaryDates {
    display: none;
    margin-bottom: rem(12);
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    text-align: center;

    @media (min-width: #{size.$desktopMin}) {
      display: block;
    }
  }

  .pageSummaryDatesMobile {
    display: block;
    margin-bottom: rem(12);
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    text-align: center;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  .pageSummaryDatesDetails {
    display: none;
    margin-bottom: rem(12);
  }

  .open {
    display: block;
  }

  @media (min-width: #{size.$desktopMin}) {
    .pageSummaryDatesDetails {
      display: block;
    }
  }

  .roomInfoBlock {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(30) rem(20);
    background: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
  }

  .dateRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .weekdayRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .bookingDetailLabel {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .detailIcon {
    width: rem(62);
    height: rem(8);
    color: var(--a-text-dark);
  }

  .detailDay {
    width: calc(100% / 3);
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .dayRight {
    text-align: right;
  }

  .weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: rem(2) rem(18);
    font-family: "Lora", serif;
    font-size: rem(14);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--card);
  }

  .pageSummaryList {
    display: flex;
    flex-direction: column;
    gap: rem(10);
  }

  .pageSummaryItem {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding: rem(12) 0;
  }

  .roomButton {
    display: flex;
    align-items: center;
    gap: rem(8);
    padding: 0 rem(20);
    width: 100%;
    height: rem(49);
  }

  .roomButtonText {
    flex: 1;
    text-align: left;
    font-family: Inter, sans-serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-white);
  }

  .roomButtonIconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(28);
    height: rem(28);
    background: var(--a-white);
    border-radius: 50%;
  }

  .roomButtonIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-text-dark);
    transition: transform 0.3s ease;
  }

  .roomButtonIconRotated {
    transform: rotate(180deg);
  }

  .roomDetails {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(16);
  }

  .roomDetailsHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .roomType {
    width: 50%;
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .roomPrice {
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .roomTariff {
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .roomDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-dark);
  }

  .roomGuestLine {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .roomTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .roomTotal strong {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
  }

  .servicesSection {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(16) 0;
  }

  .servicesHeader {
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .servicesList {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .serviceItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
    padding: rem(8) 0;
  }

  .serviceTitle {
    flex: 1;
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .serviceActions {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .servicePrice {
    font-family: "Lora", serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .removeServiceButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(24);
    height: rem(24);
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .removeServiceButton:hover {
    opacity: 0.7;
  }

  .removeIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-text-dark);
  }

  .pageSummaryDivider {
    width: 100%;
    height: rem(1);
    background-color: #000;
    margin: rem(12) 0;
  }

  .pageSummaryGrandTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
    margin-bottom: rem(12);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(20);
    }
  }

  .pageSummaryGrandTotal strong {
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(36);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .pageSummaryFooter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: rem(12);
    flex-wrap: wrap;

    @media (min-width: #{size.$desktopMin}) {
      justify-content: space-between;
    }
  }

  .pageSummaryTotal {
    display: none;
    align-items: center;
    gap: rem(8);
    font-family: Inter, sans-serif;
    font-size: rem(16);

    @media (min-width: #{size.$desktopMin}) {
      display: flex;
    }
  }

  .pageContinueButton {
    width: rem(275) !important;
    height: rem(67) !important;
    min-width: rem(275) !important;
    max-width: rem(275) !important;
    padding: 0 !important;
    border-radius: rem(20);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-size: rem(24);
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    flex-shrink: 0;

    @media (min-width: #{size.$desktopMin}) {
      width: rem(275) !important;
      height: rem(67) !important;
      min-width: rem(275) !important;
      max-width: rem(275) !important;
      padding: 0 !important;
      border-radius: rem(20);
      font-size: rem(24);
    }
  }
</style>
