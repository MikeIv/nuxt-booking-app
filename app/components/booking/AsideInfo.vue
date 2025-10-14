<script setup lang="ts">
  import type { BookingDetails as BookingDetailsType } from "~/types/booking";

  defineProps<{
    bookingDetails: BookingDetailsType | null;
  }>();

  const showBookingDetails = ref(false);
  const emit = defineEmits<{
    (e: "submit"): void;
  }>();
</script>

<template>
  <section :class="$style.bookingSection">
    <h3 :class="$style.bookingTitle">Ваше бронирование:</h3>
    <Button
      type="button"
      :class="$style.roomButton"
      class="btn__bs dark round"
      unstyled
      @click="showBookingDetails = !showBookingDetails"
    >
      <span :class="$style.roomButtonText">Номер</span>
      <UIcon
        name="i-chevron-down"
        :class="[
          $style.roomButtonIcon,
          { [$style.roomButtonIconRotated]: showBookingDetails },
        ]"
      />
    </Button>
    <BookingDetails
      v-if="showBookingDetails && bookingDetails"
      :booking-details="bookingDetails"
    />
    <Button
      type="button"
      severity="secondary"
      label="Продолжить"
      unstyled
      :class="$style.submitButton"
      class="btn__bs dark"
      @click="emit('submit')"
    />
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .bookingSection {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(24) rem(12);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    border-radius: var(--a-borderR--card);
    @media (min-width: #{size.$desktopMin}) {
      width: rem(400);
      position: sticky;
      top: rem(90);
    }
    @media (min-width: #{size.$desktopMedium}) {
      width: rem(486);
    }
    @media (min-width: #{size.$desktopMax}) {
      width: rem(566);
    }
  }

  .bookingTitle {
    margin-bottom: rem(20);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .roomButton {
    margin-bottom: rem(16);
    padding: 0 rem(20);
  }

  .roomButtonText {
    flex: 1;
    text-align: left;
  }

  .roomButtonIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-text-whitedark);
    transition: transform 0.3s ease;
  }

  .roomButtonIconRotated {
    transform: rotate(180deg);
  }

  .submitButton {
    margin-top: rem(16);
  }
</style>
