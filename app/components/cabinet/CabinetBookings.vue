<script setup lang="ts">
  import type { BookingHistoryItem } from "~/types/booking";
  import CabinetBookingCard from "./CabinetBookingCard.vue";

  interface Props {
    bookings: BookingHistoryItem[];
    isLoading: boolean;
    bookingsLoaded: boolean;
    showLoadMoreButton: boolean;
    loadMoreButtonLabel: string;
  }

  interface Emits {
    (e: "new-booking" | "load-more"): void;
    (e: "view-details", bookingId: string | number): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();
</script>

<template>
  <section :class="$style.content" aria-labelledby="bookings-heading">
    <h2 id="bookings-heading" class="visually-hidden">Мои бронирования</h2>

    <!-- Нет бронирований -->
    <div v-if="bookingsLoaded && bookings.length === 0" :class="$style.emptyState">
      <p>У вас пока нет бронирований</p>
      <Button
        unstyled
        label="Забронировать номер"
        class="btn__bs dark"
        :class="$style.bookNowBtn"
        @click="emit('new-booking')"
      />
    </div>

    <!-- Список бронирований -->
    <div v-else-if="bookingsLoaded && bookings.length > 0" :class="$style.bookingsList">
      <CabinetBookingCard
        v-for="(booking, index) in bookings"
        :key="booking.id || index"
        :booking="booking"
        @view-details="emit('view-details', $event)"
      />

      <!-- Кнопка "Загрузить ещё" / "Свернуть" -->
      <Button
        v-if="showLoadMoreButton"
        unstyled
        :label="loadMoreButtonLabel"
        class="btn__bs dark"
        :class="$style.loadMoreBtn"
        :disabled="isLoading"
        @click="emit('load-more')"
      />
    </div>

    <!-- Индикатор первоначальной загрузки -->
    <div v-if="isLoading && bookings.length === 0" :class="$style.loadingIndicator">
      Загрузка истории бронирований...
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  :global(.visually-hidden) {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: rem(750);
  }

  .loadingIndicator {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: rem(40);
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: rem(60) rem(20);
    text-align: center;

    p {
      font-size: rem(18);
      color: var(--a-text-dark);
      margin-bottom: rem(20);
    }
  }

  .bookNowBtn {
    max-width: rem(240);
  }

  .bookingsList {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    width: 100%;
  }

  .loadMoreBtn {
    width: 100%;
    max-width: rem(320);
    min-height: rem(50);
    margin: rem(24) auto 0;
    font-size: rem(16);

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
</style>

