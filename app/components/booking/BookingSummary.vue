<script setup lang="ts">
  import { computed, ref, toRefs, watch } from "vue";
  import { storeToRefs } from "pinia";
  import { formatCount } from "~/utils/declension";
  import type { DeclensionRules } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";
  import type { SelectedEntry } from "~/types/booking";

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

  const isSingleRoom = computed(() => roomEntries.value.length === 1);

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
    <div
      :class="[
        $style.pageSummaryInner,
        isDatesDetailsOpen ? $style.pageSummaryInner_expanded : undefined,
      ]"
    >
      <div :class="$style.pageSummaryHeader">
        <span :class="$style.pageSummaryTitle">Ваше бронирование:</span>
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
              <div :class="$style.roomCategoryRow">
                <span :class="$style.roomType">{{ entry.roomTitle }}</span>
                <span :class="$style.roomPrice">
                  {{ ((entry.price || 0) * nights).toLocaleString("ru-RU") }} ₽
                </span>
              </div>
              <div :class="$style.roomDivider" />
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
              <!-- Дополнительные услуги: внутри блока номера, один раз (в последнем/единственном номере) -->
              <template
                v-if="
                  isSingleRoom || entry.roomIdx === roomEntries.length - 1
                "
              >
                <div :class="$style.servicesSection">
                  <div :class="$style.servicesHeader">
                    Дополнительные услуги:
                  </div>
                  <div :class="$style.servicesList">
                    <div
                      v-for="service in selectedServices"
                      :key="service.id"
                      :class="$style.serviceItem"
                    >
                      <span :class="$style.serviceTitle">{{
                        service.title
                      }}</span>
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
                          <UIcon
                            name="i-close"
                            :class="$style.removeIcon"
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>

      <div :class="$style.pageSummaryDivider" />
      <div :class="$style.pageSummaryGrandTotal">
        <span>Итого:</span>
        <strong>{{ bookingTotal.toLocaleString("ru-RU") }} ₽</strong>
      </div>
      <div :class="$style.pageSummaryFooter">
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
      flex: 1;
      min-height: 0;
    }
  }

  .pageSummaryInner {
    background: var(--a-whiteBg);
    box-shadow: none;
    border-radius: rem(40) rem(40) 0 0;
    padding: rem(30) rem(30) rem(16);

    @media (min-width: #{size.$desktopMin}) {
      position: sticky;
      top: calc(var(--header-height, 95px) + #{rem(20)});
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
    font-weight: 700;
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
    gap: rem(20);
    align-items: center;
    padding: rem(20) rem(24);
    background: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
  }

  .dateRow {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: rem(15);
  }

  .weekdayRow {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
  }

  .bookingDetailLabel {
    font-family: Lora, serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .detailIcon {
    width: rem(62);
    height: rem(8);
    color: var(--a-text-dark);
  }

  .detailDay {
    flex-shrink: 0;
    width: rem(52);
    font-family: Lora, serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
    text-align: center;
  }

  .dayRight {
    width: rem(62);
    text-align: center;
  }

  .weekday {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(161);
    height: rem(24);
    padding: rem(4) rem(28);
    font-family: Lora, serif;
    font-size: rem(15);
    font-weight: 400;
    color: var(--a-text-dark);
    text-align: center;
    white-space: nowrap;
    border: 0.5px solid var(--a-border-dark);
    border-radius: var(--a-borderR--card);
    box-shadow: 4px 4px 102.5px -10px rgba(0, 0, 0, 0.1);
  }

  .pageSummaryList {
    display: flex;
    flex-direction: column;
    gap: rem(10);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      display: none;
    }
  }

  .pageSummaryInner_expanded .pageSummaryList {
    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      display: flex;
    }
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

  .roomCategoryRow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: rem(12);
  }

  .roomType {
    flex: 1;
    font-family: Lora, serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    line-height: 1.2;
  }

  .roomPrice {
    font-family: Lora, serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .roomTariff {
    font-family: Lora, serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .roomDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-dark);
  }

  .roomGuestLine {
    font-family: Inter, sans-serif;
    font-size: rem(16);
    font-weight: 500;
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
  }

  .servicesHeader {
    font-family: Lora, serif;
    font-size: rem(18);
    font-weight: 700;
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
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .serviceActions {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .servicePrice {
    font-family: Lora, serif;
    font-size: rem(16);
    font-weight: 700;
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
    height: 1px;
    background-color: var(--a-border-dark);
    margin: rem(12) 0;
  }

  .pageSummaryGrandTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
    margin-bottom: rem(12);
    font-family: Lora, serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .pageSummaryGrandTotal strong {
    font-family: Lora, serif;
    font-size: rem(32);
    font-weight: 700;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(32);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(32);
    }
  }

  .pageSummaryFooter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: rem(12);
    flex-wrap: wrap;
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
