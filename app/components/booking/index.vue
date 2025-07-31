<script setup lang="ts">
  const date = ref<[Date, Date] | null>(null);
  const guests = ref({
    rooms: 1,
    adults: 0,
    children: 0,
  });
  const promoCode = ref("");
</script>

<template>
  <section :class="$style.wrapper">
    <div :class="$style.form">
      <CoreDatePicker v-model="date" />
      <CoreGuestsSelector v-model="guests" />
      <CorePromoCodeInput v-model="promoCode" />

      <UButton
        :class="$style.button"
        color="bgAccent"
        class="text-white px-4 py-2"
        size="xl"
      >
        Поиск
      </UButton>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  :root {
    --calendar-width: 400px; /* Ширина календаря */
  }

  .wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    margin-bottom: rem(100);
  }

  .form {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: rem(20);
    max-width: size.$desktop;
    min-width: rem(400);
    min-height: rem(50);
    padding: rem(24) rem(28);
    background-color: var(--primary);
    border-radius: rem(16);
  }

  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(258);
    height: rem(67);
    font-family: "Inter", sans-serif;
    font-weight: 400;
    border-radius: rem(16);
    cursor: pointer;
  }
</style>
