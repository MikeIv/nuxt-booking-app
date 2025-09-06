<script setup lang="ts">
  const props = defineProps({
    room: {
      type: Object,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  // Закрытие попапа при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
    const popup = document.querySelector("[data-popup]");
    if (popup && !popup.contains(event.target as Node)) {
      closePopup();
    }
  };

  // Добавляем/удаляем обработчик при изменении isOpen
  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }
    },
  );
</script>

<template>
  <div v-if="isOpen" :class="$style.popupOverlay">
    <div :class="$style.popup" data-popup>
      <div :class="$style.popupHeader">
        <h3 :class="$style.popupTitle">Подробная информация</h3>
        <button :class="$style.closeButton" @click="closePopup">
          <UIcon name="i-heroicons-x-mark-20-solid" />
        </button>
      </div>

      <div :class="$style.popupContent">
        <!-- Основная информация -->
        <div :class="$style.infoSection">
          <h4 :class="$style.sectionTitle">Описание номера</h4>
          <p :class="$style.description">
            {{ room?.description || "Описание отсутствует" }}
          </p>
        </div>

        <!-- Характеристики -->
        <div :class="$style.infoSection">
          <h4 :class="$style.sectionTitle">Характеристики</h4>
          <div :class="$style.features">
            <div v-if="room?.area" :class="$style.featureItem">
              <UIcon name="i-heroicons-arrows-pointing-out-20-solid" />
              <span>Площадь: {{ room.area }} м²</span>
            </div>
            <div v-if="room?.capacity" :class="$style.featureItem">
              <UIcon name="i-heroicons-user-group-20-solid" />
              <span>Вместимость: {{ room.capacity }} чел.</span>
            </div>
            <div v-if="room?.bedType" :class="$style.featureItem">
              <UIcon name="i-heroicons-bed-20-solid" />
              <span>Тип кровати: {{ room.bedType }}</span>
            </div>
          </div>
        </div>

        <!-- Удобства -->
        <div v-if="room?.amenities" :class="$style.infoSection">
          <h4 :class="$style.sectionTitle">Удобства</h4>
          <div :class="$style.amenities">
            <div
              v-for="(amenity, index) in room.amenities"
              :key="index"
              :class="$style.amenityItem"
            >
              <UIcon name="i-heroicons-check-circle-20-solid" />
              <span>{{ amenity }}</span>
            </div>
          </div>
        </div>

        <!-- Цена -->
        <div v-if="room?.price" :class="$style.infoSection">
          <h4 :class="$style.sectionTitle">Стоимость</h4>
          <div :class="$style.price">
            <span :class="$style.priceValue">{{ room.price }} ₽</span>
            <span :class="$style.pricePeriod">за ночь</span>
          </div>
        </div>
      </div>

      <div :class="$style.popupFooter">
        <button :class="$style.closePopupButton" @click="closePopup">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
  .popupOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: rem(20);
  }

  .popup {
    background: white;
    border-radius: rem(12);
    padding: rem(24);
    max-width: rem(500);
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 rem(10) rem(25) rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .popupHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(24);
    padding-bottom: rem(16);
    border-bottom: 1px solid var(--a-gray-200);
  }

  .popupTitle {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .closeButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32);
    height: rem(32);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-gray-100);
    }
  }

  .popupContent {
    margin-bottom: rem(24);
  }

  .infoSection {
    margin-bottom: rem(20);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .sectionTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(12);
  }

  .description {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-gray-700);
    line-height: 1.5;
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .featureItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-gray-700);

    svg {
      color: var(--a-primary);
      width: rem(16);
      height: rem(16);
    }
  }

  .amenities {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: rem(8);
  }

  .amenityItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-gray-700);

    svg {
      color: var(--a-success);
      width: rem(16);
      height: rem(16);
    }
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: rem(8);
  }

  .priceValue {
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-primary);
  }

  .pricePeriod {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-gray-600);
  }

  .popupFooter {
    display: flex;
    justify-content: flex-end;
    padding-top: rem(16);
    border-top: 1px solid var(--a-gray-200);
  }

  .closePopupButton {
    padding: rem(8) rem(16);
    border: 1px solid var(--a-primary);
    border-radius: rem(8);
    background: var(--a-primary);
    color: white;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--a-primary-dark);
    }
  }

  /* Анимация для попапа */
  .popup {
    animation: popupFadeIn 0.3s ease-out;
  }

  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .popupOverlay {
      padding: rem(10);
    }

    .popup {
      margin: 0;
      padding: rem(16);
      max-width: calc(100vw - 20px);
    }

    .amenities {
      grid-template-columns: 1fr;
    }

    .popupHeader {
      flex-direction: row;
      gap: rem(12);
    }

    .closeButton {
      position: static;
    }
  }
</style>
