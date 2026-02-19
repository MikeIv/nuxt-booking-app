<script setup lang="ts">
  import { formatPrice } from "~/utils/price";
  import { formatCount } from "~/utils/declension";
  import type { Room } from "~/types/room";

  interface Props {
    upgradeRoom: Room | null;
    /** Все варианты номера (по типу кровати) для селекта */
    upgradeRooms?: Room[];
    loading: boolean;
    expanded: boolean;
    additionalPerNight: number;
    nights: number;
  }

  defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-popup", event: MouseEvent): void;
    (e: "toggle-expand" | "compare" | "upgrade"): void;
    (e: "bed-type-change", bedId: string): void;
  }>();
</script>

<template>
  <div :class="$style.upgradeRoomCard">
    <!-- Лоадер на время запроса -->
    <div v-if="loading" :class="$style.loader">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        stroke-width="4"
        fill="transparent"
        animation-duration="2.5s"
        aria-label="Загрузка номера повышенного комфорта"
      />
      <p :class="$style.loaderText">
        Загрузка номера повышенного комфорта...
      </p>
    </div>

    <!-- Карточка номера повышенного комфорта -->
    <template v-else-if="upgradeRoom">
      <div :class="$style.comfortLabel">
        <UIcon
          name="i-upgrade-comfort"
          :class="$style.comfortIcon"
          aria-hidden="true"
        />
        <span :class="$style.comfortText">Повысить комфорт</span>
      </div>

      <BookingRoomInfoCard
        :room="upgradeRoom"
        :rooms="upgradeRooms"
        :expanded="expanded"
        :hide-description="true"
        :accent-border="true"
        @open-popup="emit('open-popup', $event)"
        @toggle-expand="emit('toggle-expand')"
        @bed-type-change="emit('bed-type-change', $event)"
      />

      <div :class="$style.actions">
        <div :class="$style.priceBlock">
          <span :class="$style.priceValue">
            +{{ formatPrice(additionalPerNight) }} ₽
          </span>
          <span :class="$style.pricePeriod">
            {{ formatCount(nights, 'night') }}
          </span>
        </div>
        <div :class="$style.buttons">
          <button
            type="button"
            :class="$style.btnCompare"
            @click="emit('compare')"
          >
            Сравнить номера
          </button>
          <button
            type="button"
            :class="$style.btnUpgrade"
            @click="emit('upgrade')"
          >
            Улучшить номер
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style module lang="scss">
  .upgradeRoomCard {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(16);
    min-height: rem(320);
    padding: rem(40) 0;
  }

  .loaderText {
    margin: 0;
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .comfortLabel {
    display: inline-flex;
    align-items: center;
    gap: rem(10);
    width: fit-content;
    height: rem(24);
    margin-left: rem(40);
  }

  .comfortIcon {
    flex-shrink: 0;
    width: rem(24);
    height: rem(24);
    color: var(--a-text-accent);
  }

  .comfortText {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 500;
    color: var(--a-black);
    word-wrap: break-word;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: rem(16);
    padding: rem(16) rem(22) rem(16) rem(16);
    background: var(--a-whiteBg);
    border-radius: var(--a-borderR--x10);
  }

  .priceBlock {
    display: flex;
    flex-direction: column;
    gap: rem(2);
    margin-right: rem(40);
  }

  .priceValue {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-text-accent);
    word-wrap: break-word;
  }

  .pricePeriod {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
    word-wrap: break-word;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
    align-items: center;
  }

  .btnCompare,
  .btnUpgrade {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(179);
    height: rem(44);
    padding: 0 rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-white);
    border: none;
    border-radius: var(--a-borderR--btn);
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
    }
  }

  .btnCompare {
    background: var(--a-blackBg);
  }

  .btnUpgrade {
    background: var(--a-btnAccentBg);
  }
</style>
