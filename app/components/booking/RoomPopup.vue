<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  import type { Room, PackageResource } from "~/types/room";

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

  const formatPackages = (packages: PackageResource[]) => {
    return packages.map((pkg) => ({
      ...pkg,
      formattedPrice: `+${pkg.price} ₽`,
    }));
  };
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    :title="room.title"
    max-width="1000px"
    @close="closePopup"
  >
    <template #content>
      <div :class="$style.roomContent">
        <!-- Основная информация -->
        <div id="info" :class="$style.roomInfo">
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

        <!-- Галерея -->
        <div id="gallery" :class="$style.sliderWrapper">
          <UCarousel
            v-slot="{ item }"
            loop
            arrows
            :autoplay="{ delay: 3000 }"
            :items="desktopImages"
            :ui="{ item: 'basis-1/3' }"
          >
            <img
              :src="item"
              width="500"
              height="600"
              :class="$style.carouselImage"
              loading="lazy"
            />
          </UCarousel>
        </div>

        <!-- Удобства -->
        <div id="amenities" :class="$style.amenitiesSection">
          <h5 :class="$style.sectionTitle">Удобства</h5>
          <div :class="$style.amenities">
            <div
              v-for="(item, index) in room.amenities"
              :key="index"
              :class="$style.amenityItem"
            >
              <UIcon name="i-check" :class="$style.amenityIcon" />
              <span>{{ item.title }}</span>
            </div>
          </div>
        </div>

        <!-- Описание -->
        <div id="description" :class="$style.description">
          <h5 :class="$style.sectionTitle">Описание</h5>
          <div v-html="room.description" />
        </div>

        <!-- Тарифы -->
        <div
          v-if="room.tariffs && room.tariffs.length"
          id="pricing"
          :class="$style.pricing"
        >
          <h5 :class="$style.sectionTitle">Тарифы</h5>
          <div :class="$style.tariffs">
            <div
              v-for="tariff in room.tariffs"
              :key="tariff.rate_plan_code"
              :class="$style.tariffItem"
            >
              <div :class="$style.tariffHeader">
                <div :class="$style.tariffInfo">
                  <span :class="$style.tariffTitle">{{ tariff.title }}</span>
                  <span v-if="tariff.description" :class="$style.tariffDesc">
                    {{ tariff.description }}
                  </span>
                </div>
                <span :class="$style.tariffPrice">{{ tariff.price }} ₽</span>
              </div>

              <!-- Пакеты тарифа -->
              <div
                v-if="tariff.packages && tariff.packages.length"
                :class="$style.packagesSection"
              >
                <h6 :class="$style.packagesTitle">Дополнительные пакеты:</h6>
                <div :class="$style.packages">
                  <div
                    v-for="pkg in formatPackages(tariff.packages)"
                    :key="pkg.package_code"
                    :class="$style.packageItem"
                  >
                    <div :class="$style.packageInfo">
                      <strong>{{ pkg.title }}</strong>
                      <span v-if="pkg.description">{{ pkg.description }}</span>
                      <small
                        >Темп расчёта: {{ pkg.calculation_rate_title }}</small
                      >
                    </div>
                    <span :class="$style.packagePrice">{{
                      pkg.formattedPrice
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UIPopup>
</template>

<style module lang="scss">
  .roomContent {
    display: flex;
    flex-direction: column;
    gap: rem(24);
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
    border-radius: rem(20);
    background: white;
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
    gap: rem(16);
    padding: rem(40) rem(20);
  }

  .roomTitle {
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 700;
    color: var(--a-text-dark);
    margin: 0;
    line-height: 1.2;
  }

  .infoList {
    display: flex;
    gap: rem(24);
    margin: 0;
    padding: 0;
    list-style: none;
    flex-wrap: wrap;
  }

  .infoItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-size: rem(15);
    color: var(--a-text-light);
    padding: rem(8) rem(12);
    background: var(--a-gray-50);
    border-radius: rem(8);
  }

  .infoIcon {
    width: rem(18);
    height: rem(18);
    color: var(--a-primary);
  }

  .sectionTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0 0 rem(20) 0;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: rem(-8);
      left: 0;
      width: rem(40);
      height: rem(3);
      background: var(--a-primary);
      border-radius: rem(2);
    }
  }

  .description {
    padding: 0 rem(24);

    :deep(p) {
      margin: 0 0 rem(16) 0;
      font-size: rem(15);
      line-height: 1.6;
      color: var(--a-text-dark);

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(a) {
      color: var(--a-primary);
      text-decoration: underline;

      &:hover {
        color: var(--a-primary-dark);
      }
    }
  }

  .amenitiesSection {
    padding: 0 rem(24);
  }

  .amenities {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: rem(12);
  }

  .amenityItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    padding: rem(10) rem(14);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: 1px solid var(--a-gray-300);
    border-radius: rem(8);
    background: white;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--a-primary);
      transform: translateY(-1px);
      box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.1);
    }
  }

  .amenityIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-success);
    flex-shrink: 0;
  }

  .pricing {
    padding: 0 rem(24);
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(24);
  }

  .tariffItem {
    border: 1px solid var(--a-gray-200);
    border-radius: rem(16);
    padding: rem(24);
    background: white;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--a-primary);
      box-shadow: 0 rem(8) rem(24) rgba(0, 0, 0, 0.1);
    }
  }

  .tariffHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: rem(20);
    gap: rem(16);
  }

  .tariffInfo {
    flex: 1;
  }

  .tariffTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    display: block;
    margin-bottom: rem(4);
  }

  .tariffDesc {
    font-size: rem(14);
    color: var(--a-text-light);
    line-height: 1.4;
  }

  .tariffPrice {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-primary);
    white-space: nowrap;
  }

  .packagesSection {
    border-top: 1px solid var(--a-gray-200);
    padding-top: rem(20);
  }

  .packagesTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(16);
  }

  .packages {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .packageItem {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: rem(16);
    border: 1px solid var(--a-gray-300);
    border-radius: rem(12);
    background: var(--a-gray-50);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--a-primary);
      background: white;
    }
  }

  .packageInfo {
    display: flex;
    flex-direction: column;
    gap: rem(6);
    flex: 1;

    strong {
      font-size: rem(15);
      color: var(--a-text-dark);
      font-weight: 600;
    }

    span {
      font-size: rem(14);
      color: var(--a-text-light);
      line-height: 1.4;
    }

    small {
      font-size: rem(12);
      color: var(--a-gray-600);
    }
  }

  .packagePrice {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 700;
    color: var(--a-success);
    white-space: nowrap;
    margin-left: rem(16);
  }

  .sliderWrapper {
    padding: 0 rem(24);
  }

  .carouselImage {
    border-radius: rem(12);
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  @media (max-width: 768px) {
    .navigation {
      display: none;
    }

    .roomInfo,
    .description,
    .amenitiesSection,
    .pricing,
    .sliderWrapper {
      padding: 0 rem(20);
    }

    .roomTitle {
      font-size: rem(24);
    }

    .infoList {
      flex-direction: column;
      gap: rem(8);
    }

    .infoItem {
      width: 100%;
    }

    .sectionTitle {
      font-size: rem(18);

      &::after {
        width: rem(30);
      }
    }

    .amenities {
      grid-template-columns: 1fr;
    }

    .tariffHeader {
      flex-direction: column;
      align-items: flex-start;
      gap: rem(12);
    }

    .tariffPrice {
      font-size: rem(20);
    }

    .packageItem {
      flex-direction: column;
      gap: rem(12);
    }

    .packagePrice {
      align-self: flex-end;
      margin-left: 0;
    }

    .carouselImage {
      border-radius: rem(8);
    }
  }

  /* Анимации для появления контента */
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

  /* Задержки для анимаций */
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
