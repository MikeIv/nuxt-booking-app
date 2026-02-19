<script setup lang="ts">
  import type { Room } from "~/types/room";
  import { formatPrice } from "~/utils/price";
  import { formatCount } from "~/utils/declension";

  type CarouselImage = string | { placeholder: true; label?: string };

  interface Props {
    room: Room;
    images: CarouselImage[];
    advantages: string[];
    displayPrice: number;
    periodText: string;
    /** Акцентный цвет цены (для номера повышенного комфорта) */
    priceAccent?: boolean;
  }

  defineProps<Props>();
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.gallery">
      <BookingCarousel
        :images="images"
        alt-prefix="Фото номера"
        :alt-text="room.title"
        :height="'326px'"
      />
    </div>
    <p :class="$style.roomTitle">{{ room.title }}</p>
    <ul :class="$style.specs">
      <li>
        <UIcon name="i-persons" :class="$style.specIcon" />
        До {{ formatCount(room.max_occupancy, "capacity") }}
      </li>
      <li>
        <UIcon name="i-square" :class="$style.specIcon" />
        {{ room.square }} м²
      </li>
      <li>
        <UIcon name="i-dash-square" :class="$style.specIcon" />
        {{ formatCount(room.rooms, "chamber") }}
      </li>
    </ul>
    <div v-if="advantages.length" :class="$style.advantages">
      <span
        v-for="label in advantages"
        :key="label"
        :class="$style.advantageChip"
      >
        {{ label }}
      </span>
    </div>
    <div :class="$style.priceRow">
      <span
        :class="[$style.priceValue, priceAccent && $style.priceAccent]"
      >
        От {{ formatPrice(displayPrice) }} ₽
      </span>
      <span :class="$style.period">{{ periodText }}</span>
    </div>
  </div>
</template>

<style module lang="scss">
  .card {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .gallery {
    width: 100%;
    border-radius: var(--a-borderR--x10);
    overflow: hidden;
    aspect-ratio: 484 / 326;

    :global(.p-carousel-indicator-list) {
      display: none !important;
    }
  }

  .roomTitle {
    margin: 0;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    line-height: 1.2;
  }

  .specs {
    display: flex;
    flex-wrap: wrap;
    gap: rem(10) rem(25);
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .specIcon {
    width: rem(18);
    height: rem(18);
    margin-right: rem(6);
    vertical-align: middle;
    color: var(--a-text-light);
  }

  .advantages {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
  }

  .advantageChip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: rem(4) rem(14);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
    border: 1px solid var(--a-border-primary);
    border-radius: var(--a-borderR--pill);
    background: var(--a-whiteBg);
  }

  .priceRow {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    align-items: flex-start;
    width: max-content;
    margin-left: auto;
  }

  .priceValue {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .priceAccent {
    color: var(--a-btnAccentBg);
  }

  .period {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
  }
</style>
