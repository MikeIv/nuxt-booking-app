<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  import type { Room } from "~/types/room";
  import { formatCount } from "~/utils/declension";
  import { useRoomCarousel } from "~/composables/useRoomCarousel";
  import { useRoomAdvantages } from "~/composables/useRoomAdvantages";

  interface Props {
    isOpen: boolean;
    currentRoom: Room | null;
    upgradeRoom: Room | null;
    nights: number;
    guestsCount: number;
    currentPrice: number | null;
    upgradePrice: number | null;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "close" | "upgrade"): void;
  }>();

  const closeModal = () => emit("close");
  const onUpgrade = () => {
    emit("upgrade");
    closeModal();
  };

  const currentAdvantages = useRoomAdvantages(
    computed(() => props.currentRoom),
  );
  const upgradeAdvantages = useRoomAdvantages(
    computed(() => props.upgradeRoom),
  );

  const { carouselImages: currentCarouselImages } = useRoomCarousel(
    computed(() => props.currentRoom?.photos ?? []),
    2,
    3,
    "Фото номера",
  );
  const { carouselImages: upgradeCarouselImages } = useRoomCarousel(
    computed(() => props.upgradeRoom?.photos ?? []),
    2,
    3,
    "Фото номера",
  );

  const periodText = computed(() => {
    const n = props.nights;
    const g = props.guestsCount;
    return `${formatCount(n, "night")} / ${formatCount(g, "guest")}`;
  });

  const currentDisplayPrice = computed(
    () => props.currentPrice ?? props.currentRoom?.min_price ?? 0,
  );
  const upgradeDisplayPrice = computed(
    () => props.upgradePrice ?? props.upgradeRoom?.min_price ?? 0,
  );
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    max-width="1094px"
    @close="closeModal"
  >
    <template #content>
      <div :class="$style.wrapper">
        <h2 :class="$style.title">Сравнение номеров</h2>

        <div :class="$style.twoCols">
          <div :class="$style.column">
            <BookingCompareRoomCard
              v-if="currentRoom"
              :room="currentRoom"
              :images="currentCarouselImages"
              :advantages="currentAdvantages"
              :display-price="currentDisplayPrice"
              :period-text="periodText"
            />
          </div>
          <div :class="$style.column">
            <BookingCompareRoomCard
              v-if="upgradeRoom"
              :room="upgradeRoom"
              :images="upgradeCarouselImages"
              :advantages="upgradeAdvantages"
              :display-price="upgradeDisplayPrice"
              :period-text="periodText"
              price-accent
            />
          </div>
        </div>

        <div :class="$style.divider" />

        <p :class="$style.additional">
          Дополнительно: описание дополнительных опций уточняйте при бронировании.
        </p>

        <div :class="$style.footer">
          <button
            type="button"
            :class="$style.btnClose"
            @click="closeModal"
          >
            Закрыть
          </button>
          <button
            type="button"
            :class="$style.btnUpgrade"
            @click="onUpgrade"
          >
            Улучшить номер
          </button>
        </div>
      </div>
    </template>
  </UIPopup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .wrapper {
    padding: 0 rem(24);
    max-width: 100%;
  }

  .title {
    margin: 0 0 rem(24) 0;
    font-family: "Lora", serif;
    font-size: rem(22);
    font-weight: 700;
    color: var(--a-text-dark);
    line-height: 1.2;
  }

  .twoCols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: rem(40);
    align-items: start;

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      grid-template-columns: 1fr;
    }
  }

  .column {
    min-width: 0;
  }

  .divider {
    height: 1px;
    margin: rem(24) 0;
    background: var(--a-blackBg);
  }

  .additional {
    margin: 0 0 rem(24) 0;
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.4;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
    justify-content: center;
    padding-top: rem(8);
  }

  .btnClose,
  .btnUpgrade {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(274);
    height: rem(44);
    padding: 0 rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-white);
    border: none;
    border-radius: rem(10);
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

  .btnClose {
    background: var(--a-blackBg);
  }

  .btnUpgrade {
    background: var(--a-btnAccentBg);
  }
</style>
