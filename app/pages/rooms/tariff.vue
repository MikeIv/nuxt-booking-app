<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs } =
    storeToRefs(bookingStore);
  const loading = ref(true);
  const error = ref(null);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);

  onMounted(async () => {
    try {
      loading.value = true;
      if (selectedRoomType.value) {
        await bookingStore.searchWithRoomType(selectedRoomType.value);
      }
    } catch (err) {
      error.value = err;
      console.error("Ошибка при загрузке тарифов:", err);
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">
      Выбор тарифа для номера {{ selectedRoomType }}
    </h1>

    <Booking />
    <BookingAdvantages />

    <section :class="$style.tariffBlock">
      <NuxtLink to="/rooms" :class="$style.return"
        >Назад к выбору номеров</NuxtLink
      >

      <!-- Индикатор загрузки -->
      <div v-if="loading" :class="$style.loadingContainer">
        <div :class="$style.spinner" />
        <p>Загрузка тарифов...</p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-else-if="error" :class="$style.errorContainer">
        <p>Произошла ошибка при загрузке тарифов. Попробуйте позже.</p>
      </div>

      <template v-else>
        <h2 :class="$style.tariffTitle">Выберите тариф</h2>

        <div
          v-if="roomTariffs && roomTariffs.length > 0"
          :class="$style.tariffs"
        >
          <div
            v-for="(room, roomIndex) in roomTariffs"
            :key="roomIndex"
            :class="$style.tariffCard"
          >
            <!-- Информация о номере -->
            <div :class="$style.roomInfo">
              <div :class="$style.roomHeader">
                <h3 :class="$style.roomTitle">{{ room.title }}</h3>
                <div :class="$style.roomPrice">
                  от {{ room.min_price }} руб.
                </div>
              </div>

              <div :class="$style.roomDetails">
                <div :class="$style.detailItem">
                  <UIcon name="i-persons" :class="$style.detailIcon" />
                  <span>До {{ room.max_occupancy }} гостей</span>
                </div>
                <div :class="$style.detailItem">
                  <UIcon name="i-square" :class="$style.detailIcon" />
                  <span>{{ room.square }} м²</span>
                </div>
                <div :class="$style.detailItem">
                  <UIcon name="i-dash-square" :class="$style.detailIcon" />
                  <span>{{ room.rooms }} комната</span>
                </div>
              </div>

              <!-- Описание номера -->
              <div
                v-if="room.description"
                :class="$style.roomDescription"
                v-html="room.description"
              />

              <!-- Удобства номера -->
              <div :class="$style.amenitiesSection">
                <h4 :class="$style.amenitiesTitle">Удобства номера:</h4>
                <div :class="$style.amenitiesList">
                  <div
                    v-for="(amenity, amenityIndex) in room.amenities"
                    :key="amenityIndex"
                    :class="$style.amenityItem"
                  >
                    <span>{{ amenity.title }}</span>
                  </div>
                </div>
              </div>

              <!-- Фотографии номера -->
              <div
                v-if="room.photos && room.photos.length > 0"
                :class="$style.roomPhotos"
              >
                <h4 :class="$style.photosTitle">Фотографии номера:</h4>
                <div :class="$style.photosGrid">
                  <img
                    v-for="(photo, photoIndex) in room.photos"
                    :key="photoIndex"
                    :src="photo"
                    :alt="`Фото номера ${room.title}`"
                    :class="$style.photo"
                  />
                </div>
              </div>
            </div>

            <!-- Тарифы номера -->
            <div :class="$style.tariffsSection">
              <h4 :class="$style.tariffsTitle">Доступные тарифы:</h4>
              <div :class="$style.tariffsList">
                <div
                  v-for="(tariff, tariffIndex) in room.tariffs"
                  :key="tariffIndex"
                  :class="$style.tariffItem"
                >
                  <div :class="$style.tariffHeader">
                    <h5 :class="$style.tariffName">{{ tariff.title }}</h5>
                    <div :class="$style.tariffPrice">
                      {{ tariff.price }} руб.
                    </div>
                  </div>
                  <div :class="$style.tariffCode">
                    Код тарифа: {{ tariff.rate_plan_code }}
                  </div>

                  <!-- Пакеты тарифа -->
                  <div
                    v-if="tariff.packages && tariff.packages.length > 0"
                    :class="$style.tariffPackages"
                  >
                    <h6 :class="$style.packagesTitle">Включенные пакеты:</h6>
                    <div :class="$style.packagesList">
                      <span
                        v-for="(pkg, pkgIndex) in tariff.packages"
                        :key="pkgIndex"
                        :class="$style.packageItem"
                      >
                        {{ pkg }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="searchResults && !searchResults.available"
          :class="$style.noResults"
        >
          <p>К сожалению, на выбранные даты нет доступных номеров.</p>
        </div>
      </template>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }

  .tariffBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(40) 0;
  }

  .return {
    position: relative;
    margin-bottom: rem(40);
    padding-left: rem(30);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);

    &:before {
      content: "<";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 10px;
    }
  }
  .tariffTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);
  }

  .tariffCard {
    padding: rem(24);
    border-radius: var(--a-borderR--card);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    background: var(--a-white);
  }

  .roomInfo {
    margin-bottom: rem(32);
  }

  .roomHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: rem(20);
    gap: rem(16);
  }

  .roomTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    margin: 0;
    flex: 1;
  }

  .roomPrice {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-primary);
    white-space: nowrap;
  }

  .roomDetails {
    display: flex;
    gap: rem(24);
    margin-bottom: rem(20);
    flex-wrap: wrap;
  }

  .detailItem {
    display: flex;
    align-items: center;
    gap: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
  }

  .detailIcon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
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

  .amenitiesTitle {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(16);
  }

  .amenitiesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .amenityItem {
    padding: rem(8) rem(16);
    background: var(--a-bg-light);
    border-radius: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .roomPhotos {
    margin-bottom: rem(24);
  }

  .photosTitle {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(16);
  }

  .photosGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: rem(16);
  }

  .photo {
    width: 100%;
    height: rem(150);
    object-fit: cover;
    border-radius: rem(8);
  }

  .tariffsSection {
    border-top: rem(1) solid var(--a-border-light);
    padding-top: rem(24);
  }

  .tariffsTitle {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(20);
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .tariffItem {
    padding: rem(20);
    border: rem(1) solid var(--a-border-light);
    border-radius: rem(8);
    background: var(--a-bg-light);
  }

  .tariffHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(12);
    gap: rem(16);
  }

  .tariffName {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
    flex: 1;
  }

  .tariffPrice {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-primary);
    white-space: nowrap;
  }

  .tariffCode {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-light);
    margin-bottom: rem(16);
  }

  .tariffPackages {
    margin-top: rem(16);
  }

  .packagesTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(8);
  }

  .packagesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
  }

  .packageItem {
    padding: rem(4) rem(12);
    background: var(--a-white);
    border: rem(1) solid var(--a-border-light);
    border-radius: rem(6);
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    color: var(--a-text-dark);
  }

  .noResults {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  .loadingContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: rem(40) 0;
  }

  .spinner {
    width: rem(40);
    height: rem(40);
    border: rem(3) solid var(--a-border-light);
    border-top: rem(3) solid var(--a-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: rem(16);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .errorContainer {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  @media (max-width: #{size.$tabletMin}) {
    .roomHeader {
      flex-direction: column;
      align-items: flex-start;
    }

    .tariffHeader {
      flex-direction: column;
      align-items: flex-start;
    }

    .photosGrid {
      grid-template-columns: 1fr;
    }
  }
</style>
