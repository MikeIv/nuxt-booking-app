<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useAuthStore } from "~/stores/auth";
  import { storeToRefs } from "pinia";
  import {
    usePersonalForm,
    type PersonalFormData,
    type FormErrors,
    type GuestData,
  } from "~/composables/usePersonalForm";
  import { useNotificationToast } from "~/composables/useToast";
  import { useUserProfile } from "~/composables/useUserProfile";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
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

  const { formData: userProfileData, fetchUserProfile } = useUserProfile();

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

  const isRoomExpanded = (roomIdx: number) => {
    return !!expandedRooms.value[roomIdx];
  };

  // Инициализация данных гостей для каждого номера
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
      // Автоматически раскрываем первый номер
      if (index === 0) {
        expandedRooms.value[entry.roomIdx] = true;
      }
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

  // Получаем текст состава гостей для конкретного номера
  const getRoomGuestCompositionText = (roomIdx: number) => {
    const { adults, children } = getRoomGuestComposition(roomIdx);
    const parts: string[] = [];

    if (adults > 0) {
      const adultWord = adults === 1 ? 'взрослый' : 'взрослых';
      parts.push(`${adults} ${adultWord} на основном месте`);
    }

    if (children > 0) {
      const childWord = children === 1 ? 'ребенок' : children > 1 && children < 5 ? 'ребенка' : 'детей';
      parts.push(`${children} ${childWord} на дополнительном месте`);
    }

    return parts.join(', ');
  };

  // Обновление данных основного гостя для номера
  const updateRoomMainGuest = (roomIdx: number, guest: GuestData) => {
    if (!formData.roomGuests[roomIdx]) {
      formData.roomGuests[roomIdx] = createRoomGuestData();
    }
    formData.roomGuests[roomIdx].mainGuest = guest;
  };

  // Обновление данных дополнительного гостя для номера
  const updateRoomAdditionalGuest = (
    roomIdx: number,
    guestIndex: number,
    guest: GuestData,
  ) => {
    if (!formData.roomGuests[roomIdx]) {
      formData.roomGuests[roomIdx] = createRoomGuestData();
    }
    formData.roomGuests[roomIdx].additionalGuests[guestIndex] = guest;
  };

  // Получаем максимальное количество дополнительных гостей для номера
  const getMaxAdditionalGuests = (roomIdx: number): number => {
    const { adults, children } = getRoomGuestComposition(roomIdx);
    const totalGuests = adults + children;
    // Максимальное количество дополнительных гостей = общее количество - 1 (основной гость)
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

  // Удаление дополнительного гостя для номера
  const removeRoomAdditionalGuest = (roomIdx: number, guestIndex: number) => {
    if (!formData.roomGuests[roomIdx]) return;
    formData.roomGuests[roomIdx].additionalGuests.splice(guestIndex, 1);
    if (errors.roomGuests[roomIdx]) {
      errors.roomGuests[roomIdx].additionalGuests.splice(guestIndex, 1);
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

    // Проверяем режим мультибронирования
    if (isMultiRoomsMode.value) {
      if (!date.value || Object.keys(selectedMultiRooms.value).length === 0) {
        toast.add({
          severity: "error",
          summary: "Недостаточно данных для бронирования.",
          life: 3000,
        });
        return;
      }

      // Получаем package_code из selectedServices, если они есть
      // Пока оставляем пустым, так как selectedServices содержит только id, title, price
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

      // Получаем package_code из selectedServices, если они есть
      // Пока оставляем пустым, так как selectedServices содержит только id, title, price
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
    // Максимальное количество дополнительных гостей = общее количество - 1 (основной гость)
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

  const updateAdditionalGuest = (index: number, guest: GuestData) => {
    formData.additionalGuests[index] = guest;
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
      // В режиме multi-rooms не используем selectedEntry
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
      // В режиме multi-rooms используем данные из store
      return selectedMultiRooms.value;
    }
    // Для одного номера
    const entry = selectedEntry.value;
    if (!entry) return {} as Record<number, SelectedEntry>;
    return { 0: entry };
  });

  const bookingTotal = computed(() => {
    if (isMultiRoomsMode.value) {
      // Для multi-rooms считаем сумму всех номеров
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
    // Для одного номера
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

  const guestCompositionText = computed(() => {
    const { adults, children } = guestComposition.value;
    const parts: string[] = [];

    if (adults > 0) {
      const adultWord = adults === 1 ? 'взрослый' : 'взрослых';
      parts.push(`${adults} ${adultWord} на основном месте`);
    }

    if (children > 0) {
      const childWord = children === 1 ? 'ребенок' : children > 1 && children < 5 ? 'ребенка' : 'детей';
      parts.push(`${children} ${childWord} на дополнительном месте`);
    }

    return parts.join(', ');
  });

  /**
   * Преобразует данные пользователя из профиля в формат GuestData
   */
  const userToGuestData = (user: {
    name?: string;
    surname?: string;
    middle_name?: string;
    phone?: string;
    email?: string;
    country?: string;
  }): GuestData => {
    return {
      firstName: user.name || "",
      lastName: user.surname || "",
      middleName: user.middle_name || "",
      phone: user.phone || "",
      email: user.email || "",
      citizenship: user.country || "",
    };
  };

  /**
   * Проверяет, заполнена ли форма основного гостя
   */
  const isMainGuestFormFilled = (guest: GuestData): boolean => {
    return !!(
      guest.firstName ||
      guest.lastName ||
      guest.phone ||
      guest.email
    );
  };

  /**
   * Заполняет форму данными пользователя, если он авторизован
   */
  const fillFormWithUserData = async () => {
    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    try {
      await fetchUserProfile();

      const userData =
        userProfileData.name || userProfileData.surname
          ? userProfileData
          : authStore.user;

      const guestData = userToGuestData(userData);

      if (
        guestData.firstName ||
        guestData.lastName ||
        guestData.phone ||
        guestData.email
      ) {
        if (isMultiRoomsMode.value) {
          // В режиме мультибронирования заполняем данные для всех номеров
          Object.keys(selectedMultiRooms.value).forEach((roomIdxStr) => {
            const roomIdx = Number(roomIdxStr);
            if (!formData.roomGuests[roomIdx]) {
              formData.roomGuests[roomIdx] = createRoomGuestData();
            }
            // Заполняем только если форма пустая
            const roomMainGuest = formData.roomGuests[roomIdx].mainGuest;
            if (!isMainGuestFormFilled(roomMainGuest)) {
              formData.roomGuests[roomIdx].mainGuest = guestData;
            }
          });
        } else {
          // В режиме одного номера заполняем основную форму
          if (!isMainGuestFormFilled(formData.mainGuest)) {
            formData.mainGuest = guestData;
          }
        }
      }
    } catch {
      if (authStore.user) {
        const guestData = userToGuestData(authStore.user);
        if (
          guestData.firstName ||
          guestData.lastName ||
          guestData.phone ||
          guestData.email
        ) {
          if (isMultiRoomsMode.value) {
            // В режиме мультибронирования заполняем данные для всех номеров
            Object.keys(selectedMultiRooms.value).forEach((roomIdxStr) => {
              const roomIdx = Number(roomIdxStr);
              if (!formData.roomGuests[roomIdx]) {
                formData.roomGuests[roomIdx] = createRoomGuestData();
              }
              const roomMainGuest = formData.roomGuests[roomIdx].mainGuest;
              if (!isMainGuestFormFilled(roomMainGuest)) {
                formData.roomGuests[roomIdx].mainGuest = guestData;
              }
            });
          } else {
            // В режиме одного номера заполняем основную форму
            if (!isMainGuestFormFilled(formData.mainGuest)) {
              formData.mainGuest = guestData;
            }
          }
        }
      }
    }
  };

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

    await fillFormWithUserData();
    initializeRoomGuests();
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Личные данные</h1>
    <section :class="$style.personalBlock">
      <NuxtLink to="/rooms/tariff" :class="$style.return"
        >Назад к тарифам</NuxtLink
      >
      <h2 :class="$style.personalTitle">Введите свои данные</h2>
      <div :class="$style.wrapper">
        <h3 :class="$style.sectionHeader">Я бронирую</h3>
        <div :class="$style.btnBlock">
          <Button
            label="Для себя"
            class="btn__bs"
            unstyled
            @click="formData.forSelf = true"
          />
          <Button
            label="Для другого"
            class="btn__bs ghost"
            unstyled
            @click="formData.forSelf = false"
          />
        </div>
        <p :class="$style.personalNote">
          Укажите данные основного гостя. Остальных гостей — при заселении
        </p>
      </div>
    </section>
    <section :class="$style.personalBlock">
      <form :class="$style.formSection" @submit.prevent="onFormSubmit">
        <div :class="$style.formContent">
          <div :class="$style.formMain">
            <!-- Режим мультибронирования -->
            <template v-if="isMultiRoomsMode">
              <div
                v-for="entry in roomEntries"
                :key="entry.roomIdx"
                :class="$style.formItem"
              >
                <Button
                  type="button"
                  :class="$style.roomButton"
                  class="btn__bs dark round"
                  unstyled
                  :aria-expanded="isRoomExpanded(entry.roomIdx)"
                  @click="toggleRoomDetails(entry.roomIdx)"
                >
                  <span :class="$style.roomButtonGuestsTitle">Данные гостей.</span>
                  <span :class="$style.roomButtonText">
                    Номер {{ entry.roomIdx + 1 }}
                  </span>
                  <div :class="$style.roomButtonIconWrapper">
                    <UIcon
                      name="i-chevron-down"
                      :class="[
                        $style.roomButtonIcon,
                        {
                          [$style.roomButtonIconRotated]: isRoomExpanded(entry.roomIdx),
                        },
                      ]"
                    />
                  </div>
                </Button>
                <Transition name="fade">
                  <div
                    v-if="isRoomExpanded(entry.roomIdx)"
                    :class="$style.roomFormContent"
                  >
                    <div :class="$style.guestCompositionBlock">
                      <div :class="$style.guestComposition">
                        <div :class="$style.guestIcons">
                          <!-- Взрослые на основном месте -->
                          <UIcon
                            v-for="n in getRoomGuestComposition(entry.roomIdx).adults"
                            :key="'adult-' + n"
                            name="i-icon-man"
                            :class="$style.guestIconAdult"
                            aria-hidden="true"
                          />
                          <!-- Разделитель если есть дети на дополнительном месте -->
                          <UIcon
                            v-if="getRoomGuestComposition(entry.roomIdx).children > 0"
                            name="i-icon-plus-person"
                            :class="$style.guestIconPlus"
                            aria-hidden="true"
                          />
                          <!-- Дети на дополнительном месте -->
                          <UIcon
                            v-for="n in getRoomGuestComposition(entry.roomIdx).children"
                            :key="'child-' + n"
                            name="i-icon-child"
                            :class="$style.guestIconChild"
                            aria-hidden="true"
                          />
                        </div>
                        <p :class="$style.guestCompositionText">
                          {{ getRoomGuestCompositionText(entry.roomIdx) }}
                        </p>
                      </div>
                      <div :class="$style.mainGuestInfo">
                        <UIcon
                          name="i-icon-man"
                          :class="$style.mainGuestIcon"
                          aria-hidden="true"
                        />
                        <p :class="$style.mainGuestText">
                          Заполните данные основного гостя*
                        </p>
                      </div>
                    </div>
                    <BookingGuestFormFields
                      :guest="formData.roomGuests[entry.roomIdx]?.mainGuest || initialGuestData()"
                      :fields="formFields"
                      :errors="errors.roomGuests[entry.roomIdx]?.mainGuest || {}"
                      guest-title="Основной гость"
                      @update:guest="updateRoomMainGuest(entry.roomIdx, $event)"
                    />
                    <div :class="$style.checkInformBlock">
                      <div
                        v-for="checkbox in checkboxOptions"
                        :key="checkbox.id"
                        :class="$style.checkItem"
                      >
                        <Checkbox
                          v-model="formData[checkbox.key]"
                          :input-id="`${checkbox.id}-${entry.roomIdx}`"
                          :binary="true"
                          :class="$style.checkbox"
                        />
                        <label
                          :for="`${checkbox.id}-${entry.roomIdx}`"
                          :class="$style.checkboxLabel"
                        >
                          {{ checkbox.label }}
                        </label>
                      </div>
                    </div>
                    <BookingGuestFormFields
                      v-for="(guest, index) in formData.roomGuests[entry.roomIdx]?.additionalGuests || []"
                      :key="index"
                      :guest="guest"
                      :fields="formFields"
                      :errors="errors.roomGuests[entry.roomIdx]?.additionalGuests[index] || {}"
                      :guest-title="`Гость ${index + 2}`"
                      :show-remove="true"
                      @update:guest="updateRoomAdditionalGuest(entry.roomIdx, index, $event)"
                      @remove="removeRoomAdditionalGuest(entry.roomIdx, index)"
                    />
                    <Button
                      v-if="canAddRoomAdditionalGuest(entry.roomIdx)"
                      type="button"
                      :class="$style.addGuestButton"
                      unstyled
                      @click="addRoomAdditionalGuest(entry.roomIdx)"
                    >
                      <UIcon
                        name="i-icon-plus-person"
                        :class="$style.addGuestIcon"
                        aria-hidden="true"
                      />
                      <span>Добавить гостя (необязательно)</span>
                    </Button>
                  </div>
                </Transition>
              </div>
            </template>
            <!-- Режим одного номера -->
            <template v-else>
              <div :class="$style.formItem">
                <div :class="$style.guestCompositionBlock">
                  <div :class="$style.guestComposition">
                    <div :class="$style.guestIcons">
                      <!-- Взрослые на основном месте -->
                      <UIcon
                        v-for="n in guestComposition.adults"
                        :key="'adult-' + n"
                        name="i-icon-man"
                        :class="$style.guestIconAdult"
                        aria-hidden="true"
                      />
                      <!-- Разделитель если есть дети на дополнительном месте -->
                      <UIcon
                        v-if="guestComposition.children > 0"
                        name="i-icon-plus-person"
                        :class="$style.guestIconPlus"
                        aria-hidden="true"
                      />
                      <!-- Дети на дополнительном месте -->
                      <UIcon
                        v-for="n in guestComposition.children"
                        :key="'child-' + n"
                        name="i-icon-child"
                        :class="$style.guestIconChild"
                        aria-hidden="true"
                      />
                    </div>
                    <p :class="$style.guestCompositionText">
                      {{ guestCompositionText }}
                    </p>
                  </div>
                  <div :class="$style.mainGuestInfo">
                    <UIcon
                      name="i-icon-man"
                      :class="$style.mainGuestIcon"
                      aria-hidden="true"
                    />
                    <p :class="$style.mainGuestText">
                      Заполните данные основного гостя*
                    </p>
                  </div>
                </div>
                <BookingGuestFormFields
                  :guest="formData.mainGuest"
                  :fields="formFields"
                  :errors="errors.mainGuest"
                  guest-title="Основной гость"
                  @update:guest="updateMainGuest"
                />
                <div :class="$style.checkInformBlock">
                  <div
                    v-for="checkbox in checkboxOptions"
                    :key="checkbox.id"
                    :class="$style.checkItem"
                  >
                    <Checkbox
                      v-model="formData[checkbox.key]"
                      :input-id="checkbox.id"
                      :binary="true"
                      :class="$style.checkbox"
                    />
                    <label :for="checkbox.id" :class="$style.checkboxLabel">
                      {{ checkbox.label }}
                    </label>
                  </div>
                </div>
                <BookingGuestFormFields
                  v-for="(guest, index) in formData.additionalGuests"
                  :key="index"
                  :guest="guest"
                  :fields="formFields"
                  :errors="errors.additionalGuests[index]"
                  :guest-title="`Гость ${index + 2}`"
                  :show-remove="true"
                  @update:guest="updateAdditionalGuest(index, $event)"
                  @remove="removeAdditionalGuest(index)"
                />
                <Button
                  v-if="canAddAdditionalGuest"
                  type="button"
                  :class="$style.addGuestButton"
                  unstyled
                  @click="addAdditionalGuest"
                >
                  <UIcon
                    name="i-icon-plus-person"
                    :class="$style.addGuestIcon"
                    aria-hidden="true"
                  />
                  <span>Добавить гостя (необязательно)</span>
                </Button>
              </div>
            </template>
            <div :class="$style.formItem">
              <h3 :class="$style.sectionHeader">Дополнительно</h3>
              <div :class="$style.additionalBlock">
                <div
                  v-for="field in additionalFields"
                  :key="field.key"
                  :class="$style.inputItem"
                >
                  <InputText
                    v-model="formData[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    :class="$style.input"
                    unstyled
                  />
                </div>
              </div>
            </div>
            <div :class="$style.formItem">
              <h3 :class="$style.sectionHeader">Выберите способ оплаты</h3>
              <div :class="$style.paymentBlock">
                <div :class="$style.inputItem">
                  <BookingSelect
                    v-model="formData.paymentMethod"
                    :options="paymentMethods"
                    placeholder="Банковской картой"
                    :class="$style.inputSelect"
                  />
                </div>
                <div :class="$style.agreementBlock">
                  <div :class="$style.checkItem">
                    <Checkbox
                      v-model="formData.agreement"
                      input-id="agreement"
                      :binary="true"
                      :class="$style.checkbox"
                    />
                    <label for="agreement" :class="$style.checkboxLabel">
                      Фактом бронирования вы соглашаетесь с правилами
                      онлайн-бронирования, обработкой персональных данных и
                      политикой конфиденциальности
                    </label>
                  </div>
                  <Message
                    v-if="errors.agreement"
                    severity="error"
                    size="small"
                    variant="simple"
                    unstyled
                    :class="$style.errorMessage"
                  >
                    {{ errors.agreement }}
                  </Message>
                </div>
                <div :class="$style.securityText">
                  <h5 :class="$style.securityTitle">Гарантии безопасности</h5>
                  <p :class="$style.securityDescription">
                    Ввод данных и обработка платежа банковской картой проходит
                    на защищённой странице процессинговой системы, которая
                    прошла международную сертификацию. Ваши конфиденциальные
                    данные полностью защищены. Никто, в том числе система
                    бронирования, не может их получить. При работе с
                    конфиденциальными данными применяется стандарт защиты
                    информации, созданный платёжными системами Visa и MasterCard
                    — PCI DSS. Технология передачи данных гарантирует
                    безопасность за счёт использования протоколов шифрования и
                    технологии 3-D Secure. Возврат денег производится на карту,
                    с которой был произведён платёж.
                  </p>
                </div>
              </div>
            </div>
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

  .return {
    position: relative;
    margin-bottom: rem(40);
    padding-left: rem(30);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);
    text-decoration: none;
    transition: color 0.3s ease;
    &:hover {
      color: var(--a-primary);
    }
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
    margin-bottom: rem(24);
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
    padding: 0 0 rem(25) 0;
    border-bottom: rem(1) solid var(--a-border-dark);
  }

  .sectionHeader {
    font-family: "Inter", sans-serif;
    font-size: rem(24);
    font-weight: 400;
    color: var(--a-text-dark);
    margin-bottom: rem(16);
  }

  .btnBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    margin-bottom: rem(25);
    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
    }
  }

  .personalNote {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-light);
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

  .inputItem {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: rem(54);
    padding: 0 rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }
    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .inputSelect {
    display: flex;
    justify-content: space-between;
  }

  .errorMessage {
    margin-top: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-accent);
  }


  .guestCompositionBlock {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-bottom: rem(24);
  }

  .guestComposition {
    display: flex;
    align-items: center;
    gap: rem(16);
  }

  .guestIcons {
    display: flex;
    align-items: center;
    gap: rem(2);
  }

  .guestIconAdult {
    width: rem(20);
    height: rem(20);
    color: var(--a-text-light);
    flex-shrink: 0;
  }

  .guestIconChild {
    width: rem(13);
    height: rem(13);
    color: var(--a-text-light);
    flex-shrink: 0;
  }

  .guestIconPlus {
    width: rem(12);
    height: rem(12);
    color: var(--a-text-light);
    flex-shrink: 0;
    margin: 0 rem(3);
  }

  .guestCompositionText {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-light);
    margin: 0;
  }

  .mainGuestInfo {
    display: flex;
    align-items: center;
    gap: rem(12);
  }

  .mainGuestIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-text-dark);
    flex-shrink: 0;
  }

  .mainGuestText {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .addGuestButton {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: rem(12);
    width: 100%;
    height: rem(54);
    padding: 0 rem(16);
    border: rem(1) dashed var(--a-border-dark);
    border-radius: var(--a-borderR--input);
    background: transparent;
    color: var(--a-text-dark);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      border-color: var(--a-border-primary);
      color: var(--a-text-primary);
      background-color: rgba(var(--a-primaryBg), 0.05);
    }
    &:focus {
      outline: none;
      border-style: solid;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }
  }

  .addGuestIcon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
    flex-shrink: 0;
  }

  .checkInformBlock {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .checkItem {
    display: flex;
    align-items: flex-start;
    gap: rem(12);
    :global {
      .p-checkbox {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: rem(20);
        height: rem(20);
        min-width: rem(20);
        border: rem(2) solid var(--a-border-light);
        border-radius: rem(4);
        background: var(--a-whiteBg);
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .p-checkbox-checked {
        background-color: var(--a-whiteBg);
        border-color: var(--a-border-primary);
        &:before {
          content: "✓";
          color: var(--a-text-primary);
          font-size: rem(14);
          font-weight: bold;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }

  .checkbox {
    margin-top: rem(4);
    &:hover {
      border-color: var(--a-border-primary);
    }
    input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .p-checkbox-icon {
      display: none;
    }
  }

  .checkboxLabel {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    line-height: 1.4;
    cursor: pointer;
    margin-top: rem(2);
    flex: 1;
  }

  .formItem {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(24) 0;
    border-bottom: rem(1) solid var(--a-border-dark);
    &:last-of-type {
      border-bottom: none;
    }
  }

  .additionalBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
  }

  .paymentBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
  }

  .dropdown {
    width: 100%;
    height: rem(54);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    padding: 0 rem(16);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }
    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .agreementBlock {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .securityText {
    padding: rem(16);
    background: var(--a-bg-light);
    border-radius: var(--a-borderR--input);
  }

  .securityTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0 0 rem(8) 0;
  }

  .securityDescription {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    line-height: 1.5;
    color: var(--a-text-light);
    margin: 0;
  }

  .roomButton {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
    width: 100%;
    padding: 0 rem(20);
    height: rem(49);
    margin-bottom: rem(16);
  }

  .roomButtonText {
    flex: 1;
    text-align: left;
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-white);
  }

  .roomButtonGuestsTitle {
    flex-shrink: 0;
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-white);
  }

  .roomButtonIconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(28);
    height: rem(28);
    background: var(--a-white);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .roomButtonIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-text-dark);
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  .roomButtonIconRotated {
    transform: rotate(180deg);
  }

  .roomFormContent {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(16);
    margin-top: rem(8);
  }
</style>
