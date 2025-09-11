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
    <h1 :class="$style.header">Личные данные</h1>

    <Booking />

    <section :class="$style.personalBlock">
      <NuxtLink to="/rooms/tariff" :class="$style.return"
        >Назад к тарифам</NuxtLink
      >
      <h2 :class="$style.personalTitle">Введите свои данные</h2>
      <div :class="$style.wrapper">
        <h3 :class="$style.sectionHeader">Я бронирую</h3>
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

  .personalBlock {
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
  .personalTitle {
    margin-bottom: rem(25);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .sectionHeader {
    margin-bottom: rem(25);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 400;
    color: var(--a-text-dark);
  }
</style>
