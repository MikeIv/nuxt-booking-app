<script setup lang="ts">
  import type { BookingHistoryItem } from "~/types/booking";

  interface Props {
    booking: BookingHistoryItem;
  }

  interface Emits {
    (e: "view-details", bookingId: string | number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleViewDetails = () => {
    if (props.booking.id) {
      emit("view-details", props.booking.id);
    }
  };
</script>

<template>
  <article :class="$style.bookingCard">
    <header :class="$style.bookingTitle">
      {{
        booking.confirmation_number
          ? `Ваше бронирование  № ${booking.confirmation_number}`
          : `Ваше бронирование  № ${booking.id}`
      }}
    </header>

    <div
      v-if="booking.order?.start_at || booking.order?.end_at"
      :class="$style.bookingDates"
    >
      <time :datetime="booking.order?.start_at">{{ formatDate(booking.order?.start_at) }}</time>
      <span :class="$style.dateSeparator">-</span>
      <time :datetime="booking.order?.end_at">{{ formatDate(booking.order?.end_at) }}</time>
    </div>

    <footer :class="$style.bookingFooter">
      <div v-if="booking.rooms && booking.rooms.length > 0" :class="$style.bookingRooms">
        Количество номеров: {{ booking.rooms.length }}
      </div>

      <Button
        unstyled
        label="Подробнее"
        class="btn__bs dark"
        :class="$style.detailsBtn"
        :disabled="!booking.id"
        @click="handleViewDetails"
      />
    </footer>
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .bookingCard {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    background: #fff;
    border-radius: rem(12);
    box-shadow: 0 rem(2) rem(8) rgba(0, 0, 0, 0.08);
    padding: rem(24);
    width: 100%;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 rem(4) rem(16) rgba(0, 0, 0, 0.12);
    }
  }

  .bookingTitle {
    font-family: "Lora", serif;
    font-weight: 600;
    font-size: rem(16);
    color: var(--a-black);
    line-height: 1.3;
    margin-bottom: rem(18);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }
  }

  .bookingDates {
    display: flex;
    align-items: center;
    gap: rem(6);
    color: var(--a-text-dark);
    font-size: rem(16);
    font-family: "Lora", serif;
    line-height: 1.4;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(21);
    }

    time {
      white-space: nowrap;
    }
  }

  .dateSeparator {
    color: var(--a-text-light);
  }

  .bookingFooter {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    align-items: stretch;

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .bookingRooms {
    color: var(--a-text-dark);
    font-size: rem(16);
    font-family: "Lora", serif;
    line-height: 1.4;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(21);
    }
  }

  .detailsBtn {
    width: 100%;
    max-width: rem(200);
    min-height: rem(44);
    margin: 0 auto;
    padding: rem(12) rem(24);
    font-size: rem(15);

    @media (min-width: #{size.$tablet}) {
      width: auto;
      max-width: none;
      min-width: rem(160);
      margin: 0;
    }
  }
</style>

