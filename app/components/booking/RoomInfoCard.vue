<script setup lang="ts">
  import type { Room } from "~/types/room";
  import ChevronDownSelect from "~/assets/icons/chevron-down-select.svg?component";

  interface Props {
    room: Room;
    /** Все варианты номера (по типу кровати) — для селекта при accentBorder */
    rooms?: Room[];
    expanded?: boolean;
    hideDescription?: boolean;
    /** Убрать нижний отступ (когда карточка идёт перед блоком «Повысить комфорт») */
    noMarginBottom?: boolean;
    /** Показать акцентную обводку (для номера повышенного комфорта) */
    accentBorder?: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-popup", event: MouseEvent): void;
    (e: "toggle-expand" | "bed-type-change", value: string): void;
  }>();

  const visibleAmenities = computed(() => {
    const amenities = props.room.amenities || [];
    return props.expanded ? amenities : amenities.slice(0, 4);
  });

  const _toggleExpand = () => {
    emit("toggle-expand", props.room.title || "");
  };

  const _openPopup = (event: MouseEvent) => {
    emit("open-popup", event);
  };

  const getCarouselHeight = computed(() => {
    if (typeof window === "undefined") return "auto";
    const width = window.innerWidth;
    // Мобильный: < 768px
    if (width < 768) return "202px";
    // Планшет и выше: >= 768px - используем 100% для подстройки под высоту блока
    return "100%";
  });

  const { carouselImages } = useRoomCarousel(
    computed(() => props.room.photos || []),
    2,
    3,
    "Room Photo",
  );

  /** Уникальные варианты кроватей из rooms (для селекта) */
  const bedOptions = computed(() => {
    const list = props.rooms ?? (props.room?.bed ? [props.room] : []);
    const seen = new Set<number>();
    return list.filter((r) => {
      const id = r.bed?.id;
      if (id == null || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  });

  const bedTypeSelectId = computed(
    () => `room-bed-select-${props.room?.room_type_code ?? "default"}`,
  );
</script>

<template>
  <section
    :class="[
      $style.roomInfoSection,
      props.noMarginBottom && $style.roomInfoSectionCompact,
      props.accentBorder && $style.roomInfoSectionAccent,
    ]"
    class="section-shadow"
  >
    <BookingCarousel
      :images="carouselImages"
      :alt-prefix="'Фото номера'"
      :alt-text="room.title || ''"
      :height="getCarouselHeight"
      :class="$style.roomImage"
    />
    <div :class="$style.roomInfo">
      <div :class="$style.roomHeader">
        <span :class="$style.title">{{ room.title || "Без названия" }}</span>
        <BookingInfoButton
          icon-name="i-heroicons-chevron-down-20-solid"
          :data-popup-button="true"
          @click="_openPopup"
        />
      </div>

      <div
        v-if="room.description && !props.hideDescription"
        :class="$style.roomDescription"
        v-html="room.description"
      />

      <div :class="$style.amenitiesSection">
        <ul :class="$style.amenitiesList">
          <li
            v-for="(amenity, index) in visibleAmenities"
            :key="index"
            :class="$style.amenityItem"
          >
            <span>{{ amenity.title }}</span>
          </li>
          <button
            v-if="!props.expanded && (room.amenities?.length || 0) > 4"
            :class="$style.amenitiesListShow"
            @click="_toggleExpand"
          >
            + ещё {{ (room.amenities?.length || 0) - 4 }}
          </button>
        </ul>
      </div>

      <!-- Селект «Тип кровати» только для карточки повышенного комфорта (прижат к низу блока) -->
      <div v-if="props.accentBorder" :class="$style.bedTypeSelectWrapper">
        <label :for="bedTypeSelectId" :class="$style.bedTypeLabel">
          Тип кровати
        </label>
        <div :class="$style.bedTypeSelectFrame">
          <select
            :id="bedTypeSelectId"
            :class="$style.bedTypeSelect"
            :value="room.bed?.id ?? ''"
            aria-label="Тип кровати"
            @change="(e) => $emit('bed-type-change', (e.target as HTMLSelectElement).value)"
          >
            <option v-if="bedOptions.length === 0" value="">—</option>
            <option
              v-for="r in bedOptions"
              v-else
              :key="r.bed!.id"
              :value="r.bed!.id"
            >
              {{ r.bed!.title }}
            </option>
          </select>
          <span :class="$style.bedTypeChevron" aria-hidden="true">
            <ChevronDownSelect />
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .roomInfoSection {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);

    &.roomInfoSectionCompact {
      margin-bottom: 0;
    }

    &.roomInfoSectionAccent {
      margin-bottom: 0;
      border: rem(1) solid var(--a-border-primary-accent);
    }

    @media (min-width: #{size.$tablet}) {
      min-height: rem(318);
      flex-direction: row;
      padding: rem(16) rem(22) rem(16) rem(16);
    }
  }

  .roomImage {
    @media (min-width: #{size.$tablet}) {
      display: flex;
      align-self: stretch;
      width: 45%;
      max-width: 45%;
      margin-right: rem(32);
      height: 100%;
    }

    :global(.p-carousel-indicator-list) {
      display: none !important;
    }

    :global(.p-carousel) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-content) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-content-container) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-items-container) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-items-content) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-viewport) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    :global(.p-carousel-item) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        width: 100%;
        height: 100%;
      }
    }

    :global(.carouselItem) {
      @media (min-width: #{size.$tablet}) {
        display: flex;
        width: 100%;
        height: 100%;
      }
    }

    :global(img) {
      @media (min-width: #{size.$tablet}) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .roomInfo {
    margin: rem(16) 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    @media (min-width: #{size.$tablet}) {
      width: 55%;
      max-width: 55%;
      margin: 0;
      margin-right: rem(32);
      align-self: stretch;
    }
  }

  .roomHeader {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: rem(12);
    margin-bottom: rem(16);
  }

  .title {
    display: inline-flex;
    flex-shrink: 1;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: bold;
    color: var(--a-text-dark);
  }


  .roomDescription {
    margin-bottom: rem(24);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    line-height: 1.6;
    color: var(--a-text-dark);

    :global(p) {
      margin-bottom: rem(12);
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .amenitiesSection {
    margin-bottom: rem(24);
  }

  .amenitiesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .amenitiesListShow {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    color: var(--a-text-light);
    cursor: pointer;

    &:hover {
      color: var(--a-text-primary);
    }
  }

  .amenityItem {
    display: flex;
    align-items: center;
    padding: rem(2) rem(14);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--dialog);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
  }

  /* Блок селекта «Тип кровати» прижат к низу карточки */
  .bedTypeSelectWrapper {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding-top: rem(16);
  }

  .bedTypeLabel {
    font-family: "Inter", sans-serif;
    font-size: rem(19);
    font-weight: 400;
    color: var(--a-text-dark);
    word-wrap: break-word;
    cursor: pointer;
  }

  /* Селект «Тип кровати» (стили из Figma: 321×41, border #BF9D7C, radius 15px) */
  .bedTypeSelectFrame {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: rem(321);
    height: rem(41);
    padding: 0 rem(14) 0 rem(13);
    border-radius: rem(15);
    border: 1px solid var(--a-border-primary);
    background: var(--a-whiteBg);
  }

  .bedTypeSelect {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    padding-right: rem(17 + 8);
    font-family: "Inter", sans-serif;
    font-size: rem(19);
    font-weight: 400;
    color: var(--a-text-dark);
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  .bedTypeSelect:focus {
    outline: none;
  }

  /* Стрелка раскрытия из макета Figma (17×7, opacity 0.3) — не перехватывает клики */
  .bedTypeChevron {
    position: absolute;
    right: rem(14);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(17);
    height: rem(7);
    pointer-events: none;
    z-index: 0;
    color: var(--a-text-dark);

    :global(svg) {
      display: block;
      width: rem(17);
      height: rem(7);
    }
  }
</style>
