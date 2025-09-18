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
  const isPopupOpen = ref(false);
  const isServicePopupOpen = ref(false);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);

  const getCarouselHeight = computed(() => {
    if (typeof window === "undefined") return "auto";

    const width = window.innerWidth;
    if (width < 768) return "180px";
    if (width < 1024) return "362px";
    return "454px";
  });

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const openServicePopup = (event: MouseEvent) => {
    event.stopPropagation();
    isServicePopupOpen.value = true;
  };

  const closeServicePopup = () => {
    isServicePopupOpen.value = false;
  };

  const expandedRooms = ref<Record<string, boolean>>({});

  const toggleExpand = (roomTitle: string) => {
    expandedRooms.value[roomTitle] = !expandedRooms.value[roomTitle];
  };

  const visibleAmenities = (room: unknown) => {
    if (expandedRooms.value[room.title]) {
      return room.amenities;
    }
    return room.amenities.slice(0, 4);
  };

  onMounted(async () => {
    try {
      loading.value = true;
      if (selectedRoomType.value) {
        await bookingStore.searchWithRoomType(selectedRoomType.value);
        console.log("TARIF-data", searchResults.value);
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
            <section :class="$style.roomInfoWrapper">
              <BookingCarousel
                :images="room.photos || []"
                :alt-prefix="'Фото номера'"
                :alt-text="room.title"
                :height="getCarouselHeight"
              />
              <div :class="$style.roomInfo">
                <div :class="$style.roomHeader">
                  <span :class="$style.title">{{ room.title }}</span>

                  <button
                    :class="$style.infoButton"
                    data-popup-button
                    @click="openPopup($event)"
                  >
                    <UIcon
                      name="i-heroicons-chevron-down-20-solid"
                      :class="$style.chevronIcon"
                    />
                  </button>
                </div>

                <!-- Описание номера -->
                <div
                  v-if="room.description"
                  :class="$style.roomDescription"
                  v-html="room.description"
                />

                <!-- Удобства номера -->
                <div :class="$style.amenitiesSection">
                  <ul :class="$style.amenitiesList">
                    <li
                      v-for="(amenity, amenityIndex) in visibleAmenities(room)"
                      :key="amenityIndex"
                      :class="$style.amenityItem"
                    >
                      <span>{{ amenity.title }}</span>
                    </li>

                    <button
                      v-if="
                        !expandedRooms[room.title] && room.amenities.length > 4
                      "
                      :class="$style.amenitiesListShow"
                      @click="toggleExpand(room.title)"
                    >
                      + ещё {{ room.amenities.length - 4 }}
                    </button>
                  </ul>
                </div>
              </div>
            </section>

            <section :class="$style.servicesWrapper">
              <h3 :class="$style.servicesTitle">Включить дополнительно:</h3>
              <ul :class="$style.servicesList">
                <li
                  v-for="(service, servicasIndex) in searchResults.packages"
                  :key="servicasIndex"
                  :class="$style.serviceItem"
                >
                  <span :class="$style.serviceText">{{ service.title }}</span>

                  <button
                    :class="$style.serviceButton"
                    data-popup-button
                    @click="openServicePopup($event, service)"
                  >
                    <UIcon
                      name="i-heroicons-chevron-down-20-solid"
                      :class="$style.chevronIcon"
                    />
                  </button>

                  <template>
                    <BookingServicePopup
                      :service="service"
                      :is-open="isServicePopupOpen"
                      @close="closeServicePopup"
                    />
                  </template>
                </li>
              </ul>
            </section>

            <!-- Тарифы номера -->
            <section :class="$style.tariffsSection">
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
            </section>

            <BookingRoomPopup
              :room="room"
              :is-open="isPopupOpen"
              @close="closePopup"
            />
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
    display: flex;
    flex-direction: column;
  }

  .roomInfoWrapper {
    margin-bottom: rem(40);
    padding: rem(24);
    border-radius: var(--a-borderR--card);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.2);
    background: var(--a-white);
  }

  .roomInfo {
    margin: rem(16) 0 rem(32) 0;
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
    border-radius: rem(8);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
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

  .servicesWrapper {
    display: flex;
    flex-direction: column;
  }

  .servicesTitle {
    margin-bottom: rem(40);
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .servicesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .serviceItem {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: rem(290);
    min-height: rem(50);
    border-radius: rem(24);
    border: rem(1) solid var(--a-border-primary);
    cursor: pointer;
  }

  .serviceText {
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    color: var(--a-text-dark);
  }

  .serviceButton {
    position: absolute;
    right: rem(12);
    top: 50%;
    transform: translateY(-50%);
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
    z-index: 2;

    &:hover {
      background-color: var(--a-primaryBg);
      border: none;

      .chevronIcon {
        color: var(--a-white);
      }
    }
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
</style>
