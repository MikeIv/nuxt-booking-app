<script setup lang="ts">
  import type { Room } from "~/types/room";

  interface Props {
    room: Room;
    expanded?: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-popup", event: MouseEvent): void;
    (e: "toggle-expand", roomTitle: string): void;
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
    // Планшет: >= 768px и < 1366px
    if (width < 1366) return "400px";
    // Десктоп и выше: >= 1366px
    return "433px";
  });

  const { carouselImages } = useRoomCarousel(
    computed(() => props.room.photos || []),
    2,
    3,
    "Room Photo",
  );
</script>

<template>
  <section :class="$style.roomInfoSection" class="section-shadow">
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
        <button
          :class="$style.infoButton"
          data-popup-button
          @click="_openPopup"
        >
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            :class="$style.chevronIcon"
          />
        </button>
      </div>

      <div
        v-if="room.description"
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
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .roomInfoSection {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);

    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
    }
  }

  .roomImage {
    @media (min-width: #{size.$desktopMedium}) {
      width: 45%;
      margin-right: rem(32);
    }

    :global(.p-carousel-indicator-list) {
      display: none !important;
    }
  }

  .roomInfo {
    margin: rem(16) 0;

    @media (min-width: #{size.$desktopMedium}) {
      width: 55%;
      margin-right: rem(32);
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

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32);
    height: rem(32);
    min-width: auto;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-primaryBg);
      border: none;

      .chevronIcon {
        color: var(--a-white);
      }
    }
  }

  .chevronIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-black);
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
</style>
