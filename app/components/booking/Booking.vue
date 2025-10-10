<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  const toast = useToast();
  const bookingStore = useBookingStore();
  const { date, guests, promoCode, loading } = storeToRefs(bookingStore);
  const router = useRouter();
  const route = useRoute();

  const validateForm = () => {
    if (!date.value) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, выберите даты",
        life: 3000,
      });
      return false;
    }

    if (guests.value.adults === 0) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, укажите количество взрослых",
        life: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;

    bookingStore.setLoading(true, "Загружаем данные о номерах...");

    try {
      await bookingStore.search(true);
      if (route.path === "/") {
        await router.push("/rooms");
        await nextTick();
      }
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    } catch (error: unknown) {
      toast.add({
        severity: "warn",
        summary: "Поменяйте запрос",
        detail: `${(error as Error)?.message || "Неизвестная ошибка"}`,
        life: 3000,
      });
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Поиск:", {
        date: date.value,
        guests: guests.value,
        promoCode: promoCode.value,
      });
    }
  };
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
        :loading="loading"
        :disabled="loading"
        @click="handleSearch"
      >
        {{ loading ? "Поиск..." : "Поиск" }}
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
    padding: 0;

    @media (min-width: #{size.$tabletMax}) {
      margin-bottom: rem(90);
    }
    @media (min-width: #{size.$desktopMin}) {
      padding: 0;
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
      max-width: rem(280);
    }

    @media (min-width: #{size.$desktop}) {
      flex-grow: 1;
      max-width: rem(280);
    }
  }
</style>
