<script setup lang="ts">
  import { formatCount } from "~/utils/declension";

  const props = defineProps<{
    bookingDetails: {
      title?: string;
      room_type_code: string;
      check_in: string;
      check_out: string;
      check_in_date: Date | null;
      check_out_date: Date | null;
      nights: number;
      additional_services: string[];
      price: number;
      total_price: number;
    } | null;
  }>();

  console.log("bookingDetails", props.bookingDetails);

  const getWeekday = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("ru-RU", { weekday: "long" });
  };
</script>

<template>
  <div v-if="bookingDetails" :class="$style.bookingDetails">
    <div :class="$style.roomInfoBlock">
      <h2 :class="$style.title">{{ bookingDetails.title }}</h2>

      <div :class="$style.dateRow">
        <span :class="$style.bookingDetailLabel">{{
          bookingDetails.check_in
        }}</span>
        <span :class="$style.arrow">→</span>
        <span :class="$style.bookingDetailValue">{{
          bookingDetails.check_out
        }}</span>
      </div>

      <div :class="$style.weekdayRow">
        <span :class="$style.bookingDetailLabel">{{
          getWeekday(bookingDetails.check_in_date)
        }}</span>
        <span :class="$style.weekdayCenter">{{
          formatCount(bookingDetails.nights, "night")
        }}</span>
        <span :class="$style.bookingDetailValue">{{
          getWeekday(bookingDetails.check_out_date)
        }}</span>
      </div>
    </div>

    <div :class="$style.bookingDetailItem">
      <span :class="$style.bookingDetailLabel">Доп. услуги:</span>
      <span :class="$style.bookingDetailValue">
        <span
          v-for="(service, index) in bookingDetails.additional_services"
          :key="index"
          :class="$style.serviceItem"
        >
          {{ service
          }}{{
            index < bookingDetails.additional_services.length - 1 ? ", " : ""
          }}
        </span>
      </span>
    </div>

    <div :class="$style.bookingDetailItem">
      <span :class="$style.bookingDetailLabel">Стоимость:</span>
      <span :class="$style.bookingDetailValue"
        >{{ bookingDetails.price }} ₽</span
      >
    </div>

    <div :class="$style.bookingDivider" />

    <div :class="$style.bookingTotal">
      <span :class="$style.bookingTotalLabel">Итого:</span>
      <span :class="$style.bookingTotalValue"
        >{{ bookingDetails.total_price }} ₽</span
      >
    </div>
  </div>
</template>

<style module lang="scss">
  .bookingDetails {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(16);
    background: var(--a-whiteBg);
  }

  .roomInfoBlock {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(30) rem(20);
    background: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
  }

  .title {
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    color: var(--a-text-dark);
  }

  .dateRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .arrow {
    flex: 1;
    text-align: center;
    color: var(--a-text-dark);
    font-size: rem(16);
  }

  .weekdayRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .weekdayCenter {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
    text-align: center;
    flex: 1;
  }

  .bookingDetailItem {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: rem(8);
  }

  .bookingDetailLabel {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    flex-shrink: 0;
  }

  .bookingDetailValue {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
    line-height: 1.4;
    text-align: right;
  }

  .serviceItem {
    display: inline;
  }

  .bookingDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-dark);
    margin: rem(8) 0;
  }

  .bookingTotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: rem(8);
  }

  .bookingTotalLabel {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .bookingTotalValue {
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 700;
    color: var(--a-text-primary);
  }
</style>
