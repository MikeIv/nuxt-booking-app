<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  import RoomPopupCarousel from "~/components/booking/RoomPopupCarousel.vue";
  import type { Room } from "~/types/room";
  import { formatCount } from "~/utils/declension";

  interface Props {
    room: Room;
    isOpen: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  type CarouselItem = string | { placeholder: true; label?: string };

  const createPlaceholder = (): CarouselItem => ({
    placeholder: true,
    label: "Room Photo",
  });

  const carouselImages = computed<CarouselItem[]>(() => {
    const photos = props.room.photos || [];
    const photosCount = photos.length;

    if (photosCount >= 2) {
      return photos;
    }

    const placeholdersNeeded = 3 - photosCount;
    const placeholders = Array.from(
      { length: placeholdersNeeded },
      createPlaceholder,
    );

    return [...photos, ...placeholders];
  });
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    :title="room.title"
    max-width="1400px"
    @close="closePopup"
  >
    <template #content>
      <div :class="$style.roomContent">
        <div id="info" :class="$style.roomInfo">
          <h4 :class="$style.roomTitle">{{ room.title }}</h4>
          <ul :class="$style.infoList">
            <li :class="$style.infoItem">
              <UIcon name="i-persons" :class="$style.infoIcon" />
              <span>До {{ formatCount(room.max_occupancy, "capacity") }}</span>
            </li>
            <li :class="$style.infoItem">
              <UIcon name="i-square" :class="$style.infoIcon" />
              <span>{{ room.square }} м²</span>
            </li>
            <li :class="$style.infoItem">
              <UIcon name="i-dash-square" :class="$style.infoIcon" />
              <span>{{ formatCount(room.rooms, "chamber") }}</span>
            </li>
          </ul>
        </div>

        <div id="gallery" :class="$style.sliderWrapper">
          <RoomPopupCarousel
            :images="carouselImages"
            :alt-prefix="'Фото номера'"
            :alt-text="room.title"
          />
        </div>

        <div id="amenities" :class="$style.amenitiesSection">
          <div :class="$style.amenities">
            <div
              v-for="(item, index) in room.amenities"
              :key="index"
              :class="$style.amenityItem"
            >
              <span>{{ item.title }}</span>
            </div>
          </div>
        </div>

        <p :class="$style.description" v-html="room.description" />
      </div>
    </template>
  </UIPopup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .roomContent {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    overflow: hidden;
  }

  .navigation {
    display: flex;
    gap: rem(8);
    padding: 0 rem(24) rem(16) rem(24);
    border-bottom: 1px solid var(--a-gray-200);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .navButton {
    padding: rem(8) rem(16);
    border: 1px solid var(--a-gray-300);
    border-radius: var(--a-borderR--x20);
    background: var(--a-whiteBg);
    color: var(--a-text-dark);
    font-size: rem(14);
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--a-primary);
      color: var(--a-primary);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .roomInfo {
    display: flex;
    flex-direction: column;
    padding: 0 rem(20) rem(20) rem(20);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      padding: 0 rem(34) rem(20) rem(34);
    }
  }

  .roomTitle {
    margin: 0 0 rem(20) 0;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 700;
    line-height: 1.2;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      width: 50%;
      margin: 0 rem(20) 0 0;
      font-size: rem(34);
    }
  }

  .infoList {
    display: flex;
    gap: rem(14);
    margin: 0;
    padding: 0;
    list-style: none;
    flex-wrap: wrap;
  }

  .infoItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-size: rem(18);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .infoIcon {
    width: rem(22);
    height: rem(22);
    color: var(--a-text-dark);
  }

  .amenitiesSection {
    display: flex;
    width: 100%;
    padding: 0 rem(12);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(34);
    }
  }

  .amenities {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
    width: 100%;
  }

  .amenityItem {
    display: flex;
    align-items: center;
    padding: rem(2) rem(14);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--x8);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
  }

  .sliderWrapper {
    padding: 0;
    width: 100%;
    overflow: hidden;
  }

  .roomContent > * {
    animation: fadeInUp 0.4s ease forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .description {
    margin: 0 0 rem(16) 0;
    padding: 0 rem(24);
    font-family: "Lora", serif;
    font-size: rem(16);
    line-height: 1.6;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(34);
      font-size: rem(24);
    }
  }

  .roomInfo {
    animation-delay: 0.1s;
  }
  .sliderWrapper {
    animation-delay: 0.2s;
  }
  .amenitiesSection {
    animation-delay: 0.3s;
  }
  .description {
    animation-delay: 0.4s;
  }
  .pricing {
    animation-delay: 0.5s;
  }
</style>
