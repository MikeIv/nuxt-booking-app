<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { ApiError } from "~/composables/useApi";
  import { getRequestErrorContent } from "~/components/common/RequestErrorMessage.vue";
  import { useNotificationToast } from "~/composables/useToast";

  const toast = useNotificationToast();
  const bookingStore = useBookingStore();
  const { date, guests, promoCode, loading } = storeToRefs(bookingStore);
  const router = useRouter();
  const route = useRoute();

  const { getBannersByVisibility } = useBanners();

  const bookingBanners = computed(() => {
    const result = getBannersByVisibility("booking");
    
    if (import.meta?.env?.DEV) {
      console.log("🔍 bookingBanners computed:", {
        type: typeof result,
        isArray: Array.isArray(result),
        result,
      });
    }
    
    // Убеждаемся, что возвращается массив
    if (!Array.isArray(result)) {
      console.warn("Booking: getBannersByVisibility вернул не массив:", typeof result, result);
      return [];
    }
    return result;
  });

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

    const totalAdults = guests.value.roomList
      ? guests.value.roomList.reduce((sum, room) => sum + room.adults, 0)
      : 0;

    if (totalAdults === 0) {
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
      const result = await bookingStore.search({ skipReset: true });
      
      // Проверяем, что сервер вернул данные о номерах
      if (!result || !result.rooms || result.rooms.length === 0) {
        toast.add({
          severity: "warn",
          summary: "Повторите запрос позже",
          detail: "Временные неполадки. Повторите запрос немного позже",
          life: 5000,
        });
        bookingStore.setLoading(false);
        bookingStore.isServerRequest = false;
        return;
      }

      const roomsCount = guests.value?.roomList
        ? guests.value.roomList.length
        : guests.value?.rooms || 1;

      const target = roomsCount > 1 ? "/multi-rooms" : "/rooms";
      if (route.path !== target) {
        await router.push(target);
        await nextTick();
      }
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    } catch (error: unknown) {
      const { status, message } = (error || {}) as ApiError;
      const { summary, detail } = getRequestErrorContent(status, message);

      toast.add({
        severity: "warn",
        summary,
        detail,
        life: 3000,
      });
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }

    if (import.meta?.env?.DEV) {
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
      <CoreDatePickerWithPrices v-model="date" />
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
    <div v-if="bookingBanners.length > 0" :class="$style.bannersWrapper">
      <CommonBannersList :banners="bookingBanners" />
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    margin-bottom: rem(20);
    padding: 0;

    @media (min-width: #{size.$tablet}) {
      margin-bottom: rem(40);
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
    min-width: rem(300);
    min-height: rem(50);
    padding: rem(14) rem(12);
    font-family: "Inter", sans-serif;
    background-color: var(--primary);
    border-radius: var(--a-borderR--x30);

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(32) rem(24);
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: 100%;
      margin: 0 rem(24);
      padding: rem(32) rem(24);
    }

    @media (min-width: #{size.$desktopMax}) {
      margin: 0;
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

  .bannersWrapper {
    margin-top: rem(20);
    width: 100%;
    max-width: size.$desktop;
    display: flex;
    justify-content: center;
  }
</style>
