<script setup lang="ts">
  interface SelectedEntry {
    roomIdx: number;
    roomTitle: string;
    ratePlanCode: string;
    price: number | null | undefined;
    title: string;
  }

  interface Props {
    selectedEntries: Record<number, SelectedEntry>;
    date: [Date, Date] | null | undefined;
    nights: number;
    bookingTotal: number;
  }

  defineProps<Props>();
  const emit = defineEmits<{
    (e: "continue"): void;
  }>();

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

  const handleContinue = () => {
    emit("continue");
  };
</script>

<template>
  <aside :class="$style.pageSummary">
    <div :class="$style.pageSummaryInner">
      <div :class="$style.pageSummaryHeader">
        <span :class="$style.pageSummaryTitle">Ваше бронирование</span>
      </div>
      <div :class="$style.pageSummaryDates">
        {{ formatDate(date?.[0] || null) }} -
        {{ formatDate(date?.[1] || null) }}, {{ nights }}
        {{ formatNights(nights) }}
      </div>

      <div :class="$style.pageSummaryList">
        <div
          v-for="entry in Object.values(selectedEntries)"
          :key="entry.roomIdx + '-' + entry.ratePlanCode"
          :class="$style.pageSummaryItem"
        >
          <div :class="$style.pageSummaryItemHeader">
            <div :class="$style.pageSummaryItemTitle">
              Номер {{ entry.roomIdx + 1 }}
            </div>
            <div :class="$style.pageSummaryItemPrice">
              {{ (entry.price || 0).toLocaleString("ru-RU") }} ₽/ночь
            </div>
          </div>
          <div :class="$style.pageSummaryItemBody">
            <div :class="$style.pageSummaryRoomName">
              {{ entry.roomTitle }}
            </div>
            <div :class="$style.pageSummaryTariff">
              Тариф: {{ entry.title }}
            </div>
            <div :class="$style.pageSummarySubtotal">
              За номер:
              {{ ((entry.price || 0) * nights).toLocaleString("ru-RU") }} ₽
            </div>
          </div>
        </div>
      </div>

      <div :class="$style.pageSummaryDivider" />
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

  .pageSummary {
    display: block;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    background: var(--a-whiteBg);
    box-shadow: 0 0 rem(10) rgb(0 0 0 / 10%);
    border-radius: var(--a-borderR--card) var(--a-borderR--card) 0 0;
    padding: rem(12) rem(16) rem(16);

    @media (min-width: #{size.$desktopMin}) {
      position: static;
      width: 33.3333%;
      padding: 0;
      box-shadow: none;
      border-radius: 0;
      background: transparent;
    }
  }

  .pageSummaryInner {
    background: var(--a-whiteBg);
    box-shadow: none;
    border-radius: 0;
    padding: 0;

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

  .pageSummaryTitle {
    font-family: Lora, serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .pageSummaryDates {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
    margin-bottom: rem(12);
  }

  .pageSummaryList {
    display: flex;
    flex-direction: column;
    gap: rem(10);
  }

  .pageSummaryItem {
    display: flex;
    flex-direction: column;
    gap: rem(6);
    padding: rem(8) 0;
    border-bottom: 1px solid var(--a-border-primary);
  }

  .pageSummaryItemHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pageSummaryItemTitle {
    font-family: Inter, sans-serif;
    font-size: rem(12);
    color: var(--a-text-accent);
  }

  .pageSummaryItemPrice {
    font-family: Lora, serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .pageSummaryItemBody {
    display: flex;
    flex-direction: column;
    gap: rem(6);
  }

  .pageSummaryRoomName,
  .pageSummaryTariff,
  .pageSummarySubtotal {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .pageSummaryDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-primary);
    margin: rem(12) 0;
  }

  .pageSummaryFooter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .pageSummaryTotal {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-family: Inter, sans-serif;
    font-size: rem(16);
  }

  .pageContinueButton {
    padding: rem(10) rem(16);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
  }
</style>
