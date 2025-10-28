<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  import type { PackageResource } from "~/types/room";

  interface Props {
    service: PackageResource;
    isOpen: boolean;
  }

  defineProps<Props>();
  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    :title="service.title"
    max-width="1400px"
    @close="closePopup"
  >
    <template #content>
      <div :class="$style.roomContent">
        <div id="info" :class="$style.roomInfo">
          <h4 :class="$style.roomTitle">{{ service.title }}</h4>
        </div>

        <div
          v-if="service.photos?.length"
          id="gallery"
          :class="$style.sliderWrapper"
        >
          <UCarousel
            v-slot="{ item }"
            loop
            arrows
            :items="service.photos"
            :slides-per-view="1"
          >
            <div :class="$style.slideContainer">
              <img
                :src="item"
                width="300"
                height="370"
                :class="$style.carouselImage"
                loading="lazy"
              />
            </div>
          </UCarousel>
        </div>

        <p
          v-if="service.description"
          :class="$style.description"
          v-html="service.description"
        />
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

  .sliderWrapper {
    padding: 0;
    width: 100%;
    overflow: hidden;

    :global(.carousel-container) {
      padding: rem(10) 0;
      margin: 0 -10px;
    }
  }

  .slideContainer {
    padding: 0 rem(10);
  }

  .carouselImage {
    border-radius: rem(12);
    object-fit: cover;
    width: 100%;
    height: rem(370);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }

    @media (min-width: #{size.$tablet}) {
      height: rem(680);
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
</style>
