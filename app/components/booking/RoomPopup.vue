<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  interface Room {
    id: number;
    title: string;
    max_occupancy: number;
    square: number;
    rooms: number;
    min_price: number;
    // другие свойства
  }

  interface Props {
    room: Room;
    isOpen: boolean;
  }

  defineProps<Props>();
  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  const { useImages } = useImageLoader();
  const desktopImages = useImages("images/card-detail");
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    title="Подробная информация о номере"
    max-width="1000px"
    @close="closePopup"
  >
    <template #content>
      <section :class="$style.roomContent">
        <!-- Основная информация -->
        <div :class="$style.roomInfo">
          <h4 :class="$style.roomTitle">{{ room.title }}</h4>
          <ul :class="$style.infoList">
            <li :class="$style.infoItem">
              <UIcon name="i-persons" :class="$style.infoIcon" />
              <span>До {{ room.max_occupancy }} гостей</span>
            </li>
            <li :class="$style.infoItem">
              <UIcon name="i-square" :class="$style.infoIcon" />
              <span>{{ room.square }} м²</span>
            </li>
            <li :class="$style.infoItem">
              <UIcon name="i-dash-square" :class="$style.infoIcon" />
              <span>{{ room.rooms }} комнаты</span>
            </li>
          </ul>
        </div>

        <div :class="$style.sliderWrapper">
          <UCarousel
            v-slot="{ item }"
            loop
            arrows
            :autoplay="{ delay: 2000 }"
            :items="desktopImages"
            :ui="{ item: 'basis-1/3' }"
          >
            <img :src="item" width="500" height="600" class="rounded-lg" />
          </UCarousel>
        </div>

        <!-- Описание -->

        <!-- Удобства -->
        <div :class="$style.amenities">
          <template v-if="room?.amenities">
            <div
              v-for="item in room?.amenities"
              :key="item.title"
              :class="$style.amenityItem"
            >
              <span :class="$style.amenityItem">{{ item.title }}</span>
            </div>
          </template>
          <div :class="$style.amenityItem">
            <span>WI-FI</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Кондиционер</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Сейф</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Ванная комната</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Телевидение</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Система “умный дом”</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Теплый пол</span>
          </div>
          <div :class="$style.amenityItem">
            <span>Кровать «King size»</span>
          </div>
        </div>

        <div :class="$style.description">
          <p>
            One bed Suite — это идеальное сочетание элегантности и уюта.
            Необыкновенная высота потолков от трех, а в некоторых номерах и до
            пяти метров, и большие окна придают номеру особый шарм, создавая
            гармонию пространства и дизайна. В ванной комнате предусмотрены как
            ванна, так и душевая кабина, для вашего максимального комфорта.
          </p>
        </div>
      </section>
    </template>
  </UIPopup>
</template>

<style module lang="scss">
  .roomContent {
    display: flex;
    flex-direction: column;
  }

  .roomInfo {
    display: flex;
    gap: rem(24);
    width: 100%;
    padding: rem(40);
  }

  .roomTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .infoList {
    display: flex;
    gap: rem(16);
  }

  .infoItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-size: rem(14);
    color: var(--a-text-light);
  }

  .infoIcon {
    width: rem(18);
    height: rem(18);
    color: var(--a-primary);
  }

  .sectionTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0 0 rem(12) 0;
  }

  .description {
    display: flex;
    width: 100%;
    padding: 0 rem(40) rem(40) rem(40);
    p {
      margin: 0;
      font-size: rem(14);
      line-height: 1.5;
      color: var(--a-text-dark);
    }
  }

  .amenities {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    min-height: rem(40);
    padding: rem(20) rem(40) 0 rem(40);
  }

  .amenityItem {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: rem(16);
    margin-bottom: rem(16);
    padding: rem(2) rem(16);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: 1px solid var(--primary);
    border-radius: rem(8);

    & span {
      margin-bottom: rem(2);
    }
  }

  .amenityIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-primary);
  }

  .pricing {
    border-top: 1px solid var(--a-gray-200);
    padding-top: rem(16);
  }

  .priceItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: rem(16);
  }

  .price {
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-primary);
  }

  .bookButton {
    padding: rem(12) rem(24);
    border: none;
    border-radius: rem(8);
    background: var(--a-primary);
    color: white;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--a-primary-dark);
    }
  }

  .closeButton {
    padding: rem(12) rem(24);
    border: 1px solid var(--a-gray-300);
    border-radius: rem(8);
    background: transparent;
    color: var(--a-text-light);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--a-gray-100);
      border-color: var(--a-gray-400);
    }
  }

  @media (max-width: 768px) {
    .amenitiesGrid {
      grid-template-columns: 1fr;
    }

    .bookButton,
    .closeButton {
      width: 100%;
    }
  }

  .sliderWrapper {
    display: flex;
    overflow: hidden;
  }
</style>
