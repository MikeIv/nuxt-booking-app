import { defineStore } from "pinia";

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref({
      rooms: 1,
      adults: 0,
      children: 0,
    });
    const promoCode = ref("");

    const totalGuests = computed(() => {
      return guests.value.adults + guests.value.children;
    });

    function reset() {
      date.value = null;
      guests.value = { rooms: 1, adults: 0, children: 0 };
      promoCode.value = "";
    }

    async function search() {
      if (!date.value) throw new Error("Укажите даты");
      if (guests.value.adults === 0)
        throw new Error("Укажите количество гостей");

      const response = await $fetch("/api/bookings", {
        method: "POST",
        body: {
          date: date.value,
          guests: guests.value,
          promoCode: promoCode.value,
        },
      });
      return response;
    }

    return {
      date,
      guests,
      promoCode,
      totalGuests,
      search,
      reset,
    };
  },
  {
    persist: true,
  },
);
