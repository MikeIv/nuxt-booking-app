<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useToast as usePrimeToast } from "primevue/usetoast";
  import { storeToRefs } from "pinia";
  import type { BookingData } from "~/types/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const {
    selectedRoomType,
    roomTariffs,
    date,
    guests,
    promoCode,
    childrenAges,
  } = storeToRefs(bookingStore);
  const toast = usePrimeToast();

  interface GuestData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    citizenship: string;
  }

  interface FormData {
    mainGuest: GuestData;
    additionalGuests: GuestData[];
    smsConfirmation: boolean;
    specialOffers: boolean;
    checkInTime: string;
    checkOutTime: string;
    comment: string;
    paymentMethod: string;
    agreement: boolean;
    forSelf: boolean;
  }

  const formData = reactive<FormData>({
    mainGuest: {
      lastName: "",
      firstName: "",
      middleName: "",
      phone: "",
      email: "",
      citizenship: "",
    },
    additionalGuests: [],
    smsConfirmation: false,
    specialOffers: false,
    checkInTime: "",
    checkOutTime: "",
    comment: "",
    paymentMethod: "",
    agreement: false,
    forSelf: true,
  });

  const { validateRegisterForm } = useFormValidation();

  const errors = reactive<{
    mainGuest: Partial<GuestData>;
    additionalGuests: Array<Partial<GuestData>>;
    agreement: string;
  }>({
    mainGuest: {},
    additionalGuests: [],
    agreement: "",
  });

  const paymentMethods = [
    { label: "Банковской картой", value: "card" },
    { label: "Наличными при заселении", value: "cash" },
    { label: "Банковским переводом", value: "transfer" },
  ];

  const guestToRegisterData = (guest: GuestData) => ({
    surname: guest.lastName,
    name: guest.firstName,
    middle_name: guest.middleName || null,
    phone: guest.phone,
    email: guest.email,
    country: guest.citizenship,
    password: "dummy_password",
    password_confirmation: "dummy_password",
  });

  const validateGuest = (guest: GuestData): Partial<GuestData> => {
    const guestErrors: Partial<GuestData> = {};
    const registerData = guestToRegisterData(guest);
    const guestValidation = validateRegisterForm(registerData, true);
    if (guestValidation.surname) guestErrors.lastName = guestValidation.surname;
    if (guestValidation.name) guestErrors.firstName = guestValidation.name;
    if (guestValidation.middle_name)
      guestErrors.middleName = guestValidation.middle_name;
    if (guestValidation.phone) guestErrors.phone = guestValidation.phone;
    if (guestValidation.email) guestErrors.email = guestValidation.email;
    if (guestValidation.country)
      guestErrors.citizenship = guestValidation.country;
    return guestErrors;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    errors.mainGuest = {};
    errors.additionalGuests = [];
    errors.agreement = "";
    const mainGuestErrors = validateGuest(formData.mainGuest);
    if (Object.keys(mainGuestErrors).length > 0) {
      errors.mainGuest = mainGuestErrors;
      isValid = false;
    }
    formData.additionalGuests.forEach((guest, index) => {
      const guestErrors = validateGuest(guest);
      if (Object.keys(guestErrors).length > 0) {
        if (!errors.additionalGuests[index]) {
          errors.additionalGuests[index] = {};
        }
        Object.assign(errors.additionalGuests[index], guestErrors);
        isValid = false;
      }
    });
    if (!formData.agreement) {
      errors.agreement = "Необходимо согласие с правилами бронирования.";
      isValid = false;
    }
    return isValid;
  };

  const formatDateTime = (date: Date, time: string): string | null => {
    if (!date || !time) return null;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      console.warn(`Неверный формат времени: ${time}. Ожидается HH:mm.`);
      return null;
    }
    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toISOString();
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

    if (!date.value || !selectedRoomType.value || !roomTariffs.value) {
      toast.add({
        severity: "error",
        summary: "Недостаточно данных для бронирования.",
        life: 3000,
      });
      return;
    }

    const selectedTariff = roomTariffs.value.find(
      (tariff) => tariff.room_type_code === selectedRoomType.value,
    );

    if (!selectedTariff) {
      toast.add({
        severity: "error",
        summary: "Выберите тариф для бронирования.",
        life: 3000,
      });
      return;
    }

    const bookingData: BookingData = {
      guests: [
        {
          name: formData.mainGuest.firstName,
          surname: formData.mainGuest.lastName,
          middle_name: formData.mainGuest.middleName || null,
          phone: formData.mainGuest.phone,
          email: formData.mainGuest.email,
          country: formData.mainGuest.citizenship,
        },
        ...formData.additionalGuests.map((guest) => ({
          name: guest.firstName,
          surname: guest.lastName,
          middle_name: guest.middleName || null,
          phone: guest.phone,
          email: guest.email,
          country: guest.citizenship,
        })),
      ],
      subscribe_newsletter: formData.specialOffers,
      payment_method: formData.paymentMethod,
      for_self: formData.forSelf,
      order: {
        start_at: date.value?.[0]
          ? bookingStore.formatDate(date.value[0])
          : null,
        end_at: date.value?.[1] ? bookingStore.formatDate(date.value[1]) : null,
        adults: guests.value.adults,
        childs: childrenAges.value.slice(0, guests.value.children),
        promocode: promoCode.value || null,
        room_type_code: selectedRoomType.value,
        rate_plan_code: selectedTariff?.tariff_details?.rate_plan_code || null,
        packages: bookingDetails.value?.additional_services || [],
      },
      sms_confirmation: formData.smsConfirmation,
      additional: {
        start_at:
          date.value?.[0] && formData.checkInTime
            ? formatDateTime(date.value[0], formData.checkInTime)
            : null,
        end_at:
          date.value?.[1] && formData.checkOutTime
            ? formatDateTime(date.value[1], formData.checkOutTime)
            : null,
        comment: formData.comment || null,
      },
    };

    try {
      bookingStore.setLoading(true, "Создаём бронирование...");
      await bookingStore.createBooking(bookingData);
      toast.add({
        severity: "success",
        summary: "Бронирование успешно создано!",
        life: 3000,
      });
      console.log("Form data:", formData);
      console.log("Booking data:", bookingData);
    } catch (error) {
      console.log("error:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка при создании бронирования.",
        detail: bookingStore.error.value || "Произошла ошибка.",
        life: 5000,
      });
    } finally {
      bookingStore.setLoading(false);
      bookingStore.isServerRequest = false;
    }
  };

  const addAdditionalGuest = () => {
    formData.additionalGuests.push({
      lastName: "",
      firstName: "",
      middleName: "",
      phone: "",
      email: "",
      citizenship: "",
    });
    errors.additionalGuests.push({});
  };

  const removeAdditionalGuest = (index: number) => {
    formData.additionalGuests.splice(index, 1);
    errors.additionalGuests.splice(index, 1);
  };

  const formFields = [
    {
      key: "lastName" as const,
      placeholder: "Фамилия",
      type: "text",
      required: true,
    },
    {
      key: "firstName" as const,
      placeholder: "Имя",
      type: "text",
      required: true,
    },
    {
      key: "middleName" as const,
      placeholder: "Отчество",
      type: "text",
      required: false,
    },
    {
      key: "phone" as const,
      placeholder: "Номер телефона",
      type: "tel",
      required: true,
    },
    {
      key: "email" as const,
      placeholder: "Почта",
      type: "email",
      required: true,
    },
    {
      key: "citizenship" as const,
      placeholder: "Гражданство",
      type: "text",
      required: false,
    },
  ];

  const checkboxOptions = [
    {
      id: "sms",
      key: "smsConfirmation" as const,
      label: "Пришлите SMS-подтверждение",
    },
    {
      id: "information",
      key: "specialOffers" as const,
      label: "Я хочу узнавать о специальных предложениях и новостях",
    },
  ];

  const additionalFields = [
    {
      key: "checkInTime" as const,
      placeholder: "Время заезда",
      type: "text",
    },
    {
      key: "checkOutTime" as const,
      placeholder: "Время выезда",
      type: "text",
    },
    {
      key: "comment" as const,
      placeholder: "Комментарий",
      type: "text",
    },
  ];

  const bookingDetails = computed(() => {
    if (!roomTariffs.value || roomTariffs.value.length === 0) return null;
    const selectedTariff = roomTariffs.value.find(
      (tariff) => tariff.room_type_code === selectedRoomType.value,
    );
    if (!selectedTariff) return null;
    console.log("selectedTariff", selectedTariff);
    return {
      title: selectedTariff?.title,
      room_type_code: selectedTariff.room_type_code,
      check_in: date.value?.[0] ? formatDate(date.value[0]) : "",
      check_out: date.value?.[1] ? formatDate(date.value[1]) : "",
      check_in_date: date.value?.[0] ? new Date(date.value[0]) : null,
      check_out_date: date.value?.[1] ? new Date(date.value[1]) : null,
      nights: calculateNights(),
      additional_services: getAdditionalServices(),
      price: selectedTariff.price,
      total_price: selectedTariff.price,
    };
  });

  const calculateNights = () => {
    if (!date.value || date.value.length < 2) return 0;
    const start = new Date(date.value[0]);
    const end = new Date(date.value[1]);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAdditionalServices = () => {
    const services = [];
    if (promoCode.value) {
      services.push(`Промокод: ${promoCode.value}`);
    }
    if (guests.value.children > 0) {
      services.push(`Дети: ${guests.value.children}`);
    }
    return services.length > 0 ? services : ["Без дополнительных услуг"];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  onMounted(() => {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;
  });
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
            <div :class="$style.formItem">
              <h3 :class="$style.sectionHeader">Данные гостей</h3>
              <div :class="$style.guestBlock">
                <h4 :class="$style.guestTitle">Основной гость</h4>
                <div
                  v-for="field in formFields"
                  :key="field.key"
                  :class="$style.inputItem"
                >
                  <InputText
                    v-model="formData.mainGuest[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    :class="[
                      $style.input,
                      errors.mainGuest[field.key] && $style.inputError,
                    ]"
                    unstyled
                  />
                  <Message
                    v-if="errors.mainGuest[field.key]"
                    severity="error"
                    size="small"
                    variant="simple"
                    unstyled
                    :class="$style.errorMessage"
                  >
                    {{ errors.mainGuest[field.key] }}
                  </Message>
                </div>
              </div>
              <div
                v-for="(guest, index) in formData.additionalGuests"
                :key="index"
                :class="$style.guestBlock"
              >
                <div :class="$style.guestHeader">
                  <h4 :class="$style.guestTitle">Гость {{ index + 2 }}</h4>
                  <Button
                    type="button"
                    unstyled
                    :class="$style.removeButton"
                    @click="removeAdditionalGuest(index)"
                  >
                    <UIcon name="i-close" :class="$style.icon" />
                  </Button>
                </div>
                <div
                  v-for="field in formFields"
                  :key="field.key"
                  :class="$style.inputItem"
                >
                  <InputText
                    v-model="guest[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    :class="[
                      $style.input,
                      errors.additionalGuests[index]?.[field.key] &&
                        $style.inputError,
                    ]"
                    unstyled
                  />
                  <Message
                    v-if="errors.additionalGuests[index]?.[field.key]"
                    severity="error"
                    size="small"
                    variant="simple"
                    unstyled
                    :class="$style.errorMessage"
                  >
                    {{ errors.additionalGuests[index]?.[field.key] }}
                  </Message>
                </div>
              </div>
              <Button
                type="button"
                label="+ Добавить гостя"
                :class="$style.addGuestButton"
                unstyled
                @click="addAdditionalGuest"
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
            </div>
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
                  <Dropdown
                    v-model="formData.paymentMethod"
                    :options="paymentMethods"
                    option-label="label"
                    option-value="value"
                    placeholder="Банковской картой"
                    :class="$style.dropdown"
                    unstyled
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
          <BookingAsideInfo
            :booking-details="bookingDetails"
            @submit="onFormSubmit"
          />
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
      grid-template-columns: 1fr auto;
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

  .guestBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(24);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .guestHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: rem(16);
  }

  .guestTitle {
    width: 100%;
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .removeButton {
    width: rem(24);
    height: rem(24);
    min-width: rem(24);
    border-radius: 50%;
    cursor: pointer;
    &:hover {
      background-color: var(--a-btnAccentBg);
      .icon {
        color: var(--a-text-white);
      }
    }
  }

  .icon {
    width: rem(24);
    height: rem(24);
    color: var(--a-text-accent);
  }

  .inputItem {
    display: flex;
    flex-direction: column;
    width: 100%;
    @media (min-width: #{size.$desktopMedium}) {
      width: 45%;
    }
  }

  .input {
    display: flex;
    justify-content: center;
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

  .inputError {
    border-color: var(--a-border-accent) !important;
    &:focus {
      border-color: var(--a-error);
      box-shadow: 0 0 0 2px rgba(var(--a-btnAccentBg), 0.1);
    }
  }

  .errorMessage {
    margin-top: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-accent);
  }

  .addGuestButton {
    display: flex;
    justify-content: center;
    align-items: center;
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
</style>
