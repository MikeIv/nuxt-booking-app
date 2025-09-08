<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults } = storeToRefs(bookingStore);

  console.log("searchResults-TARIF", searchResults);
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор тарифа для номера 1</h1>
    <Booking />

    <section :class="$style.advantages">
      <h2 :class="$style.advantagesTitle">
        Получите дополнительные преимущества
      </h2>
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

  .advantages {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .advantagesTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
  }
</style>
