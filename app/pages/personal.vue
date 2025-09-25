<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useToast as usePrimeToast } from "primevue/usetoast";
  import { reactive } from "vue";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs } =
    storeToRefs(bookingStore);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);

  const toast = usePrimeToast();

  // Интерфейс для формы
  interface FormData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    citizenship: string;
    smsConfirmation: boolean;
    specialOffers: boolean;
  }

  // Данные формы
  const formData = reactive<FormData>({
    lastName: "",
    firstName: "",
    middleName: "",
    phone: "",
    email: "",
    citizenship: "",
    smsConfirmation: false,
    specialOffers: false,
  });

  // Ошибки валидации
  const errors = reactive({
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
  });

  // Валидация email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона (базовая проверка)
  const validatePhone = (phone: string): boolean => {
    return phone.replace(/\D/g, "").length >= 10;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    let isValid = true;

    // Сброс ошибок
    Object.keys(errors).forEach((key) => {
      errors[key as keyof typeof errors] = "";
    });

    // Валидация обязательных полей
    if (!formData.lastName.trim()) {
      errors.lastName = "Фамилия обязательна для заполнения.";
      isValid = false;
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "Имя обязательно для заполнения.";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Номер телефона обязателен для заполнения.";
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Введите корректный номер телефона.";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email обязателен для заполнения.";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Введите корректный email адрес.";
      isValid = false;
    }

    return isValid;
  };

  const onFormSubmit = () => {
    if (validateForm()) {
      toast.add({
        severity: "success",
        summary: "Форма успешно отправлена.",
        life: 3000,
      });
      console.log("Form data:", formData);

      // Здесь можно добавить логику навигации или отправки данных
      // navigateTo('/next-step');
    } else {
      toast.add({
        severity: "error",
        summary: "Пожалуйста, исправьте ошибки в форме.",
        life: 3000,
      });
    }
  };

  // Массив полей формы для оптимизации рендеринга
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
          <Button label="Для себя" class="btn__bs" unstyled />
          <Button label="Для другого" class="btn__bs ghost" unstyled />
        </div>
        <p :class="$style.personalNote">
          Укажите данные основного гостя. Остальных гостей — при заселении
        </p>
      </div>
    </section>

    <section :class="$style.personalBlock">
      <h3 :class="$style.sectionHeader">Данные гостей</h3>
      <form :class="$style.formSection" @submit.prevent="onFormSubmit">
        <!-- Оптимизированный рендеринг полей формы -->
        <div
          v-for="field in formFields"
          :key="field.key"
          :class="$style.inputItem"
        >
          <InputText
            v-model="formData[field.key]"
            :type="field.type"
            :placeholder="field.placeholder"
            :class="[$style.input, errors[field.key] && $style.inputError]"
            unstyled
          />
          <Message
            v-if="errors[field.key]"
            severity="error"
            size="small"
            variant="simple"
            unstyled
            :class="$style.errorMessage"
          >
            {{ errors[field.key] }}
          </Message>
        </div>

        <!-- Чекбоксы с исправленной стилизацией -->
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

        <Button
          type="submit"
          severity="secondary"
          label="Продолжить"
          :class="$style.submitButton"
        />
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
    margin-bottom: rem(24);
    font-family: "Inter", sans-serif;
    font-size: rem(24);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .btnBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    margin-bottom: rem(25);
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
    gap: rem(24);
    width: 100%;
  }

  .inputItem {
    display: flex;
    flex-direction: column;
    width: 100%;
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

    // Иконка галочки PrimeVue - скрываем
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

  .submitButton {
    margin-top: rem(16);
    height: rem(54);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 600;
  }

  // Адаптивность
  @media (max-width: size.$tablet) {
    .personalBlock {
      padding: rem(12) rem(16);
    }

    .header {
      font-size: rem(28);
      margin: rem(30) 0;
    }

    .personalTitle {
      font-size: rem(24);
    }

    .sectionHeader {
      font-size: rem(20);
    }
  }

  @media (max-width: size.$mobile) {
    .personalBlock {
      padding: rem(12) rem(12);
    }

    .header {
      font-size: rem(24);
      margin: rem(20) 0;
    }

    .personalTitle {
      font-size: rem(20);
    }

    .sectionHeader {
      font-size: rem(18);
    }

    .btnBlock {
      gap: rem(16);
    }

    .input {
      height: rem(48);
      font-size: rem(14);
    }

    .submitButton {
      height: rem(48);
      font-size: rem(16);
    }
  }
</style>
