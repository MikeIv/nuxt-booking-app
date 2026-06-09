<script setup lang="ts">
  import type { BookingHistoryItem } from "~/types/booking";
  import {
    getBookingDisplayNumber,
    getBookingStatusLabel,
  } from "~/utils/bookingStatus";

  interface Props {
    booking: BookingHistoryItem;
  }

  interface Emits {
    (e: "view-details", bookingId: string | number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const bookingNumber = computed(() => getBookingDisplayNumber(props.booking));
  const bookingStatusLabel = computed(() =>
    getBookingStatusLabel(props.booking.status),
  );

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
    const bookingUuid = props.booking.uuid ?? props.booking.id;
    if (bookingUuid) {
      emit("view-details", bookingUuid);
    }
  };
</script>

<template>
  <article :class="$style.bookingCard">
    <header :class="$style.bookingTitle">
      Ваше бронирование № {{ bookingNumber }}
    </header>

    <p :class="$style.bookingStatus">
      Статус бронирования: {{ bookingStatusLabel }}
    </p>

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
        :disabled="!(booking.uuid ?? booking.id)"
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
    background: var(--a-whiteBg);
    border-radius: rem(12);
    box-shadow: 0 rem(2) rem(8) var(--a-shadow-color);
    padding: rem(24);
    width: 100%;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 rem(4) rem(16) var(--a-shadow-color-strong);
    }
  }

  .bookingTitle {
    font-family: var(--a-font-heading);
    font-weight: 600;
    font-size: rem(16);
    color: var(--a-text-dark);
    line-height: 1.3;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }
  }

  .bookingStatus {
    margin: 0 0 rem(18);
    font-family: var(--a-font-heading);
    font-size: rem(14);
    font-weight: 400;
    line-height: 1.4;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .bookingDates {
    display: flex;
    align-items: center;
    gap: rem(6);
    color: var(--a-text-dark);
    font-size: rem(16);
    font-family: var(--a-font-heading);
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
    font-family: var(--a-font-heading);
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
