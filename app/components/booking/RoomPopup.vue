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

        <!-- Описание -->
        <div :class="$style.description">
          <h5 :class="$style.sectionTitle">Описание</h5>
          <p>
            Просторный номер с современным дизайном и всеми удобствами для
            комфортного проживания.
          </p>
        </div>

        <!-- Удобства -->
        <div :class="$style.amenities">
          <h5 :class="$style.sectionTitle">Удобства</h5>
          <div :class="$style.amenitiesGrid">
            <div :class="$style.amenityItem">
              <UIcon name="i-wifi" :class="$style.amenityIcon" />
              <span>Wi-Fi</span>
            </div>
            <div :class="$style.amenityItem">
              <UIcon name="i-tv" :class="$style.amenityIcon" />
              <span>Телевизор</span>
            </div>
            <div :class="$style.amenityItem">
              <UIcon name="i-ac" :class="$style.amenityIcon" />
              <span>Кондиционер</span>
            </div>
            <div :class="$style.amenityItem">
              <UIcon name="i-minibar" :class="$style.amenityIcon" />
              <span>Минибар</span>
            </div>
          </div>
        </div>

        <!-- Цены -->
        <div :class="$style.pricing">
          <h5 :class="$style.sectionTitle">Стоимость</h5>
          <div :class="$style.priceItem">
            <span>От</span>
            <strong :class="$style.price"
              >{{ room.min_price }} руб./ночь</strong
            >
          </div>
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
    p {
      margin: 0;
      font-size: rem(14);
      line-height: 1.5;
      color: var(--a-text-light);
    }
  }

  .amenitiesGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: rem(12);
  }

  .amenityItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-size: rem(14);
    color: var(--a-text-light);
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
</style>
