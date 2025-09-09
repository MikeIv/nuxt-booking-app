<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { storeToRefs } from "pinia";

  const bookingStore = useBookingStore();
  const { date, guests, promoCode, searchResults } = storeToRefs(bookingStore);
  const router = useRouter();
  const isSearching = ref(false);

  const validateForm = () => {
    if (!date.value) {
      alert("Пожалуйста, выберите даты");
      return false;
    }

    if (guests.value.adults === 0) {
      alert("Пожалуйста, укажите количество взрослых");
      return false;
    }

    return true;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;

    isSearching.value = true;

    try {
      console.log("Making search request...");

      await bookingStore.search();
      if (useRoute().path === "/") {
        await router.push("/rooms");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      isSearching.value = false;
    }

    console.log("Поиск:", {
      date: date.value,
      guests: guests.value,
      promoCode: promoCode.value,
    });
  };

  onMounted(async () => {
    if (date.value && guests.value.adults > 0 && !searchResults.value) {
      await handleSearch();
    }
  });
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
        :loading="isSearching"
        :disabled="isSearching"
        @click="handleSearch"
      >
        {{ isSearching ? "Поиск..." : "Поиск" }}
      </UButton>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    margin-bottom: rem(40);
    padding: 0 rem(16);

    @media (min-width: #{size.$tabletMax}) {
      margin-bottom: rem(90);
    }
  }

  .form {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: rem(20);
    max-width: size.$desktop;
    min-width: rem(400);
    min-height: rem(50);
    padding: rem(14) rem(12);
    font-family: "Inter", sans-serif;
    background-color: var(--primary);
    border-radius: rem(16);

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(40) rem(24);
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: 100%;
      padding: rem(40) rem(24);
    }
  }

  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: rem(67);
    font-family: "Inter", sans-serif;
    font-weight: 400;
    border-radius: rem(16);
    cursor: pointer;

    @media (min-width: #{size.$desktopMin}) {
      width: calc(50% - rem(12));
    }

    @media (min-width: #{size.$desktopMedium}) {
      flex-grow: 1;
      width: auto;
    }
  }
</style>
