<script setup lang="ts">
import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import {
  usePersonalForm,
  type PersonalFormData,
  type FormErrors,
  type GuestData,
} from "~/composables/usePersonalForm";
import { useNotificationToast } from "~/composables/useToast";
import { usePersonalPageLogic } from "~/composables/usePersonalPageLogic";
import BookingForSection from "~/components/booking/BookingForSection.vue";
import BookingMultiRoomGuestForm from "~/components/booking/MultiRoomGuestForm.vue";
import BookingSingleRoomGuestForm from "~/components/booking/SingleRoomGuestForm.vue";
import BookingAdditionalFieldsSection from "~/components/booking/AdditionalFieldsSection.vue";
import BookingPaymentSection from "~/components/booking/PaymentSection.vue";

definePageMeta({
  layout: "steps",
});

const router = useRouter();
const bookingStore = useBookingStore();
const {
  selectedRoomType,
  selectedTariff: selectedTariffStore,
  roomTariffs,
  date,
  selectedServices,
  selectedMultiRooms,
} = storeToRefs(bookingStore);
const toast = useNotificationToast();

const {
  formFields,
  paymentMethods,
  checkboxOptions,
  additionalFields,
  createFormData,
  createRoomGuestData,
  initialGuestData,
  validateForm: validatePersonalForm,
  prepareBookingData,
  prepareMultiBookingData,
} = usePersonalForm();

const { fillFormWithUserData } = usePersonalPageLogic();

const formData = reactive<PersonalFormData>(createFormData());

const errors = reactive<FormErrors>({
  mainGuest: {},
  additionalGuests: [],
  roomGuests: {},
  agreement: "",
});

const validateForm = (): boolean => {
  return validatePersonalForm(formData, errors, isMultiRoomsMode.value);
};

// Проверяем, есть ли выбранные номера из multi-rooms
const isMultiRoomsMode = computed(
  () => Object.keys(selectedMultiRooms.value).length > 0,
);

// Состояние для отслеживания раскрытых номеров
const expandedRooms = ref<Record<number, boolean>>({});

const toggleRoomDetails = (roomIdx: number) => {
  expandedRooms.value[roomIdx] = !expandedRooms.value[roomIdx];
};

const initializeRoomGuests = () => {
  if (!isMultiRoomsMode.value) return;

  const sortedEntries = Object.values(selectedMultiRooms.value).sort(
    (a, b) => a.roomIdx - b.roomIdx,
  );

  sortedEntries.forEach((entry, index) => {
    if (!formData.roomGuests[entry.roomIdx]) {
      formData.roomGuests[entry.roomIdx] = createRoomGuestData();
    }
    if (!errors.roomGuests[entry.roomIdx]) {
      errors.roomGuests[entry.roomIdx] = {
        mainGuest: {},
        additionalGuests: [],
      };
    }
    // Все блоки «Данные гостей» открыты по умолчанию
    expandedRooms.value[entry.roomIdx] = true;
  });
};

// Получаем список номеров для отображения
const roomEntries = computed(() => {
  if (!isMultiRoomsMode.value) return [];
  return Object.values(selectedMultiRooms.value).sort(
    (a, b) => a.roomIdx - b.roomIdx,
  );
});

// Получаем состав гостей для конкретного номера
const getRoomGuestComposition = (roomIdx: number) => {
  const room = bookingStore.guests.roomList[roomIdx];
  if (!room) return { adults: 0, children: 0 };
  return {
    adults: room.adults || 0,
    children: room.children || 0,
  };
};

// Обновление данных основного гостя для номера
const updateRoomMainGuest = (payload: { roomIdx: number; guest: GuestData }) => {
  if (!formData.roomGuests[payload.roomIdx]) {
    formData.roomGuests[payload.roomIdx] = createRoomGuestData();
  }
  const roomGuest = formData.roomGuests[payload.roomIdx];
  if (roomGuest) {
    roomGuest.mainGuest = payload.guest;
  }
};

// Обновление данных дополнительного гостя для номера
const updateRoomAdditionalGuest = (
  payload: { roomIdx: number; guestIndex: number; guest: GuestData },
) => {
  if (!formData.roomGuests[payload.roomIdx]) {
    formData.roomGuests[payload.roomIdx] = createRoomGuestData();
  }
  const roomGuest = formData.roomGuests[payload.roomIdx];
  if (roomGuest) {
    roomGuest.additionalGuests[payload.guestIndex] = payload.guest;
  }
};

// Получаем максимальное количество дополнительных гостей для номера
const getMaxAdditionalGuests = (roomIdx: number): number => {
  const { adults, children } = getRoomGuestComposition(roomIdx);
  const totalGuests = adults + children;
  return Math.max(0, totalGuests - 1);
};

// Проверяем, можно ли добавить еще гостя для номера
const canAddRoomAdditionalGuest = (roomIdx: number): boolean => {
  const maxGuests = getMaxAdditionalGuests(roomIdx);
  if (maxGuests === 0) return false;
  const currentAdditionalGuests = formData.roomGuests[roomIdx]?.additionalGuests?.length || 0;
  return currentAdditionalGuests < maxGuests;
};

// Добавление дополнительного гостя для номера
const addRoomAdditionalGuest = (roomIdx: number) => {
  if (!canAddRoomAdditionalGuest(roomIdx)) return;
  
  if (!formData.roomGuests[roomIdx]) {
    formData.roomGuests[roomIdx] = createRoomGuestData();
  }
  formData.roomGuests[roomIdx].additionalGuests.push(initialGuestData());
  if (!errors.roomGuests[roomIdx]) {
    errors.roomGuests[roomIdx] = {
      mainGuest: {},
      additionalGuests: [],
    };
  }
  errors.roomGuests[roomIdx].additionalGuests.push({});
};

const removeRoomAdditionalGuest = (payload: { roomIdx: number; guestIndex: number }) => {
  const roomGuest = formData.roomGuests[payload.roomIdx];
  if (!roomGuest || !roomGuest.additionalGuests) return;
  roomGuest.additionalGuests.splice(payload.guestIndex, 1);
  const roomErrors = errors.roomGuests[payload.roomIdx];
  if (roomErrors && roomErrors.additionalGuests) {
    roomErrors.additionalGuests.splice(payload.guestIndex, 1);
  }
};

// Обновление данных формы для номера (чекбоксы)
const updateRoomFormData = (payload: { roomIdx: number; key: string; value: boolean }) => {
  if (!formData.roomGuests[payload.roomIdx]) {
    formData.roomGuests[payload.roomIdx] = createRoomGuestData();
  }
  // Для мультибронирования чекбоксы применяются только к первому номеру
  if (payload.roomIdx === 0) {
    const checkboxKey = payload.key as keyof Pick<PersonalFormData, 'smsConfirmation' | 'specialOffers'>;
    if (checkboxKey === 'smsConfirmation' || checkboxKey === 'specialOffers') {
      formData[checkboxKey] = payload.value;
    }
  }
};

const onFormSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: "error",
      summary: "Пожалуйста, исправьте ошибки в форме.",
      life: 3000,
    });
    return;
  }

  if (isMultiRoomsMode.value) {
    if (!date.value || Object.keys(selectedMultiRooms.value).length === 0) {
      toast.add({
        severity: "error",
        summary: "Недостаточно данных для бронирования.",
        life: 3000,
      });
      return;
    }

    const packages: string[] = [];

    const bookingData = prepareMultiBookingData(
      formData,
      date.value,
      selectedMultiRooms.value,
      bookingStore.formatDate,
      bookingStore.guests.roomList,
      packages.length > 0 ? packages : undefined,
    );

    if (!bookingData) {
      toast.add({
        severity: "error",
        summary: "Ошибка при подготовке данных бронирования.",
        life: 3000,
      });
      return;
    }

    try {
      bookingStore.setLoading(true, "Создаём бронирование...");
      await bookingStore.createBooking(bookingData);
      toast.add({
        severity: "success",
        summary: "Бронирование успешно создано!",
        life: 3000,
      });
      await router.push("/confirmation");
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка при создании бронирования.",
        detail: bookingStore.error || "Произошла ошибка.",
        life: 5000,
      });
    } finally {
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }
  } else {
    // Режим одного номера
    if (!date.value || !selectedRoomType.value || !selectedTariff.value) {
      toast.add({
        severity: "error",
        summary: "Недостаточно данных для бронирования.",
        life: 3000,
      });
      return;
    }

    const roomGuests = bookingStore.guests.roomList[0];
    const guestsData = roomGuests
      ? {
          adults: roomGuests.adults || 1,
          children: roomGuests.children || 0,
          childrenAges: roomGuests.childrenAges || [],
        }
      : { adults: 1, children: 0, childrenAges: [] };

    const packages: string[] = [];

    const bookingData = prepareBookingData(
      formData,
      date.value,
      selectedRoomType.value,
      selectedTariff.value,
      bookingStore.formatDate,
      guestsData,
      packages.length > 0 ? packages : undefined,
    );

    if (!bookingData) {
      toast.add({
        severity: "error",
        summary: "Ошибка при подготовке данных бронирования.",
        life: 3000,
      });
      return;
    }

    try {
      bookingStore.setLoading(true, "Создаём бронирование...");
      await bookingStore.createBooking(bookingData);
      toast.add({
        severity: "success",
        summary: "Бронирование успешно создано!",
        life: 3000,
      });
      await router.push("/confirmation");
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка при создании бронирования.",
        detail: bookingStore.error || "Произошла ошибка.",
        life: 5000,
      });
    } finally {
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }
  }
};

// Получаем максимальное количество дополнительных гостей для одного номера
const maxAdditionalGuests = computed(() => {
  const { adults, children } = guestComposition.value;
  const totalGuests = adults + children;
  return Math.max(0, totalGuests - 1);
});

// Проверяем, можно ли добавить еще гостя
const canAddAdditionalGuest = computed(() => {
  if (maxAdditionalGuests.value === 0) return false;
  return formData.additionalGuests.length < maxAdditionalGuests.value;
});

const addAdditionalGuest = () => {
  if (!canAddAdditionalGuest.value) return;
  formData.additionalGuests.push(initialGuestData());
  errors.additionalGuests.push({});
};

const removeAdditionalGuest = (index: number) => {
  formData.additionalGuests.splice(index, 1);
  errors.additionalGuests.splice(index, 1);
};

const updateMainGuest = (guest: GuestData) => {
  formData.mainGuest = guest;
};

const updateAdditionalGuest = (payload: { index: number; guest: GuestData }) => {
  formData.additionalGuests[payload.index] = payload.guest;
};

// Обновление данных формы (чекбоксы)
const updateFormData = (payload: { key: string; value: boolean }) => {
  const checkboxKey = payload.key as keyof Pick<PersonalFormData, 'smsConfirmation' | 'specialOffers'>;
  if (checkboxKey === 'smsConfirmation' || checkboxKey === 'specialOffers') {
    formData[checkboxKey] = payload.value;
  }
};

// Обновление дополнительных полей
const updateAdditionalField = (payload: { key: string; value: string }) => {
  const fieldKey = payload.key as keyof Pick<PersonalFormData, 'checkInTime' | 'checkOutTime' | 'comment'>;
  if (fieldKey === 'checkInTime' || fieldKey === 'checkOutTime' || fieldKey === 'comment') {
    formData[fieldKey] = payload.value;
  }
};

const selectedRoom = computed(() => {
  if (!roomTariffs.value?.length) return null;
  return (
    roomTariffs.value.find(
      (room) => room.room_type_code === selectedRoomType.value,
    ) || roomTariffs.value[0] || null
  );
});

const selectedTariff = computed(() => {
  if (selectedTariffStore?.value) return selectedTariffStore.value;
  if (!selectedRoom.value?.tariffs?.length) return null;
  return selectedRoom.value.tariffs[0] || null;
});

const nights = useNights(date);

interface SelectedEntry {
  roomIdx: number;
  roomCardIdx: number;
  roomTitle: string;
  room_type_code: string;
  ratePlanCode: string;
  price: number | null | undefined;
  title: string;
}

const selectedEntry = computed<SelectedEntry | null>(() => {
  if (isMultiRoomsMode.value) {
    return null;
  }
  if (!selectedRoom.value || !selectedTariff.value) return null;
  return {
    roomIdx: 0,
    roomCardIdx: 0,
    roomTitle: selectedRoom.value.title || "",
    room_type_code: selectedRoom.value.room_type_code,
    ratePlanCode: selectedTariff.value.rate_plan_code,
    price: selectedTariff.value.price,
    title: selectedTariff.value.title || "",
  };
});

// Преобразуем selectedEntry в формат для BookingSummary
const selectedByRoomIdx = computed<Record<string, SelectedEntry>>(() => {
  if (isMultiRoomsMode.value) {
    return selectedMultiRooms.value;
  }
  const entry = selectedEntry.value;
  if (!entry) return {} as Record<number, SelectedEntry>;
  return { 0: entry };
});

const bookingTotal = computed(() => {
  if (isMultiRoomsMode.value) {
    const roomsTotal = Object.values(selectedMultiRooms.value).reduce(
      (sum, e) => {
        const perNight = e.price || 0;
        return sum + perNight * nights.value;
      },
      0,
    );
    const servicesTotal = selectedServices.value.reduce(
      (sum, s) => sum + s.price,
      0,
    );
    return roomsTotal + servicesTotal;
  }
  if (!selectedTariff.value?.price) return 0;
  const roomTotal = selectedTariff.value.price * nights.value;
  const servicesTotal = selectedServices.value.reduce((sum, s) => sum + s.price, 0);
  return roomTotal + servicesTotal;
});

const guestComposition = computed(() => {
  const room = bookingStore.guests.roomList[0];
  if (!room) return { adults: 0, children: 0 };
  return {
    adults: room.adults || 0,
    children: room.children || 0,
  };
});

// Данные формы для номеров (чекбоксы)
const roomFormData = computed(() => {
  const data: Record<number, { smsConfirmation: boolean; specialOffers: boolean }> = {};
  Object.keys(formData.roomGuests).forEach((roomIdxStr) => {
    const roomIdx = Number(roomIdxStr);
    data[roomIdx] = {
      smsConfirmation: formData.smsConfirmation,
      specialOffers: formData.specialOffers,
    };
  });
  return data;
});

onMounted(async () => {
  bookingStore.setLoading(false);
  bookingStore.isServerRequest = false;

  // Проверяем режим мультибронирования
  if (isMultiRoomsMode.value) {
    if (Object.keys(selectedMultiRooms.value).length === 0) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Номера не выбраны",
        life: 3000,
      });
      await router.push("/multi-rooms");
      return;
    }
  } else {
    // Режим одного номера
    if (!selectedRoom.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Номер не выбран",
        life: 3000,
      });
      await router.push("/rooms");
      return;
    }
    if (!selectedTariff.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Тариф не выбран",
        life: 3000,
      });
      await router.push("/rooms");
      return;
    }
  }

  // Сначала инициализируем структуру roomGuests (если режим мультибронирования)
  initializeRoomGuests();
  // Затем заполняем данными пользователя (если авторизован)
  await fillFormWithUserData(
    formData,
    isMultiRoomsMode,
    selectedMultiRooms,
    createRoomGuestData,
  );
});
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Личные данные</h1>
    <BookingForSection v-model="formData.forSelf" />
    <section :class="$style.personalBlock">
      <form :class="$style.formSection" @submit.prevent="onFormSubmit">
        <div :class="$style.formContent">
          <div :class="$style.formMain">
            <!-- Режим мультибронирования -->
            <BookingMultiRoomGuestForm
              v-if="isMultiRoomsMode"
              :room-entries="roomEntries"
              :room-guests="formData.roomGuests"
              :form-fields="formFields"
              :errors="errors.roomGuests"
              :get-room-guest-composition="getRoomGuestComposition"
              :checkbox-options="checkboxOptions"
              :form-data="roomFormData"
              :can-add-room-additional-guest="canAddRoomAdditionalGuest"
              :expanded-rooms="expandedRooms"
              @toggle:room="toggleRoomDetails"
              @update:main-guest="updateRoomMainGuest"
              @update:additional-guest="updateRoomAdditionalGuest"
              @remove:additional-guest="removeRoomAdditionalGuest"
              @add:additional-guest="addRoomAdditionalGuest"
              @update:form-data="updateRoomFormData"
            />
            <!-- Режим одного номера -->
            <BookingSingleRoomGuestForm
              v-else
              :main-guest="formData.mainGuest"
              :additional-guests="formData.additionalGuests"
              :form-fields="formFields"
              :errors="errors"
              :guest-composition="guestComposition"
              :checkbox-options="checkboxOptions"
              :form-data="{
                smsConfirmation: formData.smsConfirmation,
                specialOffers: formData.specialOffers,
              }"
              :can-add-additional-guest="canAddAdditionalGuest"
              @update:main-guest="updateMainGuest"
              @update:additional-guest="updateAdditionalGuest"
              @remove:additional-guest="removeAdditionalGuest"
              @add:additional-guest="addAdditionalGuest"
              @update:form-data="updateFormData"
            />
            <BookingAdditionalFieldsSection
              :fields="additionalFields"
              :form-data="{
                checkInTime: formData.checkInTime,
                checkOutTime: formData.checkOutTime,
                comment: formData.comment,
              }"
              @update:form-data="updateAdditionalField"
            />
            <BookingPaymentSection
              :payment-methods="paymentMethods"
              :payment-method="formData.paymentMethod"
              :agreement="formData.agreement"
              :agreement-error="errors.agreement"
              @update:payment-method="formData.paymentMethod = $event"
              @update:agreement="formData.agreement = $event"
            />
          </div>
          <div :class="$style.summaryWrapper">
            <BookingSummary
              v-if="selectedEntry || isMultiRoomsMode"
              :selected-entries="selectedByRoomIdx"
              :date="date"
              :nights="nights"
              :booking-total="bookingTotal"
              @continue="onFormSubmit"
            />
          </div>
        </div>
      </form>
    </section>
  </div>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.container {
  display: flex;
  flex-direction: column;
  margin-bottom: rem(40);
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
  padding: rem(12) rem(20);

  @media (min-width: #{size.$desktopMedium}) {
    max-width: #{size.$desktop};
    margin: 0 auto;
  }
}

.formSection {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.formContent {
  display: flex;
  flex-direction: column;
  gap: rem(32);
  @media (min-width: #{size.$desktopMin}) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: rem(40);
    align-items: start;
  }
}

.formMain {
  display: flex;
  flex-direction: column;
  gap: rem(32);
  @media (min-width: #{size.$desktopMin}) {
    gap: rem(32);
  }
}

.summaryWrapper {
  display: flex;
  width: 100%;
  @media (min-width: #{size.$desktopMin}) {
    width: 100%;
  }
}
</style>
