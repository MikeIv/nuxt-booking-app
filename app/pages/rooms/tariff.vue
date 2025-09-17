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
          <!-- ... отображение тарифов ... -->
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
    margin-bottom: rem(40);
  }

  .tariffCard {
    margin-bottom: rem(16);
  }

  .noResults {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  .roomInfoBlock {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: rem(20) rem(10);
    border-radius: var(--a-borderR--card);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);

    @media (min-width: #{size.$tabletMin}) {
      padding: rem(22) rem(14);
    }
  }

  .roomImg {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: rem(16);
    border-radius: var(--a-borderR--card);
    overflow: hidden;

    img {
      width: 100%;
      height: rem(180);
      object-fit: cover;

      @media (min-width: #{size.$desktopMin}) {
        height: rem(400);
      }
    }
  }

  .title {
    width: 100%;
    margin-bottom: rem(16);
    text-align: left;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: bold;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
    }
  }
  .description {
    width: 100%;
    margin-bottom: rem(16);
    text-align: left;
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 400;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }
  .amenitiesSection {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: rem(16);
  }
  .amenityItem {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: rem(2) rem(16);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: 1px solid var(--primary);
    border-radius: rem(8);

    & span {
      margin-bottom: rem(2);
    }
  }

  .showMoreButton {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-light);
    cursor: pointer;
  }

  .additionallyBlock {
    display: flex;
    flex-direction: column;
  }

  .additionallyTitle {
    width: 100%;
    margin-bottom: rem(16);
    text-align: left;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: bold;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
    }
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
