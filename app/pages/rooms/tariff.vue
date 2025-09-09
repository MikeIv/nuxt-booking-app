<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs } =
    storeToRefs(bookingStore);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);
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
      <h2 :class="$style.tariffTitle">Выберите тариф</h2>
      <div v-if="roomTariffs && roomTariffs.length > 0" :class="$style.tariffs">
        <div
          v-for="(tariff, index) in roomTariffs"
          :key="index"
          :class="$style.tariffCard"
        >
          <h3>Тариф #{{ index + 1 }}</h3>
          <p>Цена: {{ tariff.price }} руб.</p>
          <p>
            Доступность: {{ tariff.available ? "Доступен" : "Не доступен" }}
          </p>
          <!-- Дополнительная информация о тарифе -->
        </div>
      </div>

      <div
        v-else-if="searchResults && !searchResults.available"
        :class="$style.noResults"
      >
        <p>К сожалению, на выбранные даты нет доступных номеров.</p>
      </div>
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
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;
  }

  .tariffs {
    margin-bottom: rem(40);
    padding: rem(20);
  }

  .tariffCard {
    padding: rem(16);
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
</style>
