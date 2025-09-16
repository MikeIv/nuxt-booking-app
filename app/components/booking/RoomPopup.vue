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

  // Функция для отображения пакетов
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

        <!-- Удобства -->
        <div :class="$style.amenitiesSection">
          <h5 :class="$style.sectionTitle">Удобства</h5>
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

        <!-- Описание -->
        <div :class="$style.description">
          <h5 :class="$style.sectionTitle">Описание</h5>
          <div v-html="room.description" />
        </div>

        <!-- Тарифы -->
        <div v-if="room.tariffs && room.tariffs.length" :class="$style.pricing">
          <h5 :class="$style.sectionTitle">Тарифы</h5>
          <div :class="$style.tariffs">
            <div
              v-for="tariff in room.tariffs"
              :key="tariff.rate_plan_code"
              :class="$style.tariffItem"
            >
              <div :class="$style.tariffHeader">
                <span :class="$style.tariffTitle">{{ tariff.title }}</span>
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
    flex-direction: column;
    gap: rem(16);
    width: 100%;
    padding: rem(40) rem(40) rem(20) rem(40);
  }

  .roomTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    margin: 0;
  }

  .infoList {
    display: flex;
    gap: rem(16);
    margin: 0;
    padding: 0;
    list-style: none;
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
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0 0 rem(16) 0;
  }

  .description {
    width: 100%;
    padding: rem(20) rem(40);

    :deep(p) {
      margin: 0;
      font-size: rem(14);
      line-height: 1.5;
      color: var(--a-text-dark);
    }
  }

  .amenitiesSection {
    padding: rem(20) rem(40);
  }

  .amenities {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .amenityItem {
    display: flex;
    align-items: center;
    padding: rem(8) rem(16);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: 1px solid var(--primary);
    border-radius: rem(8);
    background: var(--a-gray-50);
  }

  .pricing {
    padding: rem(20) rem(40);
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(24);
  }

  .tariffItem {
    border: 1px solid var(--a-gray-200);
    border-radius: rem(12);
    padding: rem(20);
    background: var(--a-gray-50);
  }

  .tariffHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(16);
  }

  .tariffTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .tariffPrice {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-primary);
  }

  .packagesSection {
    border-top: 1px solid var(--a-gray-200);
    padding-top: rem(16);
  }

  .packagesTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(12);
  }

  .packages {
    display: flex;
    flex-direction: column;
    gap: rem(12);
  }

  .packageItem {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: rem(12);
    border: 1px solid var(--a-gray-300);
    border-radius: rem(8);
    background: white;
  }

  .packageInfo {
    display: flex;
    flex-direction: column;
    gap: rem(4);

    strong {
      font-size: rem(14);
      color: var(--a-text-dark);
    }

    span {
      font-size: rem(13);
      color: var(--a-text-light);
    }

    small {
      font-size: rem(12);
      color: var(--a-gray-500);
    }
  }

  .packagePrice {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-success);
    white-space: nowrap;
  }

  .sliderWrapper {
    display: flex;
    overflow: hidden;
    padding: 0 rem(40) rem(20) rem(40);
  }

  @media (max-width: 768px) {
    .roomInfo,
    .description,
    .amenitiesSection,
    .pricing,
    .sliderWrapper {
      padding: rem(20);
    }

    .infoList {
      flex-direction: column;
      gap: rem(8);
    }

    .tariffHeader {
      flex-direction: column;
      align-items: flex-start;
      gap: rem(8);
    }

    .packageItem {
      flex-direction: column;
      gap: rem(8);
    }

    .packagePrice {
      align-self: flex-end;
    }
  }
</style>
