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

  // Интерфейс для данных гостя
  interface GuestData {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    citizenship: string;
  }

  // Интерфейс для формы
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
  }

  // Данные формы
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
  });

  // Ошибки валидации
  const errors = reactive<{
    mainGuest: Partial<GuestData>;
    additionalGuests: Array<Partial<GuestData>>;
    agreement: string;
  }>({
    mainGuest: {},
    additionalGuests: [],
    agreement: "",
  });

  // Способы оплаты
  const paymentMethods = [
    { label: "Банковской картой", value: "card" },
    { label: "Наличными при заселении", value: "cash" },
    { label: "Банковским переводом", value: "transfer" },
  ];

  // Валидация email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона (базовая проверка)
  const validatePhone = (phone: string): boolean => {
    return phone.replace(/\D/g, "").length >= 10;
  };

  // Валидация данных гостя
  const validateGuest = (guest: GuestData): Partial<GuestData> => {
    const guestErrors: Partial<GuestData> = {};

    if (!guest.lastName.trim()) {
      guestErrors.lastName = "Фамилия обязательна для заполнения.";
    }

    if (!guest.firstName.trim()) {
      guestErrors.firstName = "Имя обязательно для заполнения.";
    }

    if (!guest.phone.trim()) {
      guestErrors.phone = "Номер телефона обязателен для заполнения.";
    } else if (!validatePhone(guest.phone)) {
      guestErrors.phone = "Введите корректный номер телефона.";
    }

    if (!guest.email.trim()) {
      guestErrors.email = "Email обязателен для заполнения.";
    } else if (!validateEmail(guest.email)) {
      guestErrors.email = "Введите корректный email адрес.";
    }

    return guestErrors;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    let isValid = true;

    // Сброс ошибок
    errors.mainGuest = {};
    errors.additionalGuests = [];
    errors.agreement = "";

    // Валидация основного гостя
    const mainGuestErrors = validateGuest(formData.mainGuest);
    if (Object.keys(mainGuestErrors).length > 0) {
      errors.mainGuest = mainGuestErrors;
      isValid = false;
    }

    // Валидация дополнительных гостей
    formData.additionalGuests.forEach((guest, index) => {
      const guestErrors = validateGuest(guest, index + 1);
      if (Object.keys(guestErrors).length > 0) {
        errors.additionalGuests[index] = guestErrors;
        isValid = false;
      }
    });

    // Валидация соглашения
    if (!formData.agreement) {
      errors.agreement = "Необходимо согласие с правилами бронирования.";
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
    } else {
      toast.add({
        severity: "error",
        summary: "Пожалуйста, исправьте ошибки в форме.",
        life: 3000,
      });
    }
  };

  // Добавление нового гостя
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

  // Удаление гостя
  const removeAdditionalGuest = (index: number) => {
    formData.additionalGuests.splice(index, 1);
    errors.additionalGuests.splice(index, 1);
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

  // Поля для блока "Дополнительно"
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
      <form :class="$style.formSection" @submit.prevent="onFormSubmit">
        <div :class="$style.formItem">
          <h3 :class="$style.sectionHeader">Данные гостей</h3>
          <!-- Основной гость -->
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

          <!-- Дополнительные гости -->
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

          <!-- Кнопка добавления гостя -->
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

        <!-- Блок "Дополнительно" -->
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

        <!-- Блок "Способ оплаты" -->
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
                Ввод данных и обработка платежа банковской картой проходит на
                защищённой странице процессинговой системы, которая прошла
                международную сертификацию. Ваши конфиденциальные данные
                полностью защищены. Никто, в том числе система бронирования, не
                может их получить. При работе с конфиденциальными данными
                применяется стандарт защиты информации, созданный платёжными
                системами Visa и MasterCard — PCI DSS. Технология передачи
                данных гарантирует безопасность за счёт использования протоколов
                шифрования и технологии 3-D Secure. Возврат денег производится
                на карту, с которой был произведён платёж.
              </p>
            </div>
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
    gap: rem(32);
    width: 100%;
  }

  .guestBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(24);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
  }

  .guestHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(16);
  }

  .guestTitle {
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

  .submitButton {
    margin-top: rem(16);
    height: rem(54);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 600;
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

    .guestBlock {
      padding: rem(20);
    }

    .guestTitle {
      font-size: rem(16);
    }

    .securityText {
      padding: rem(12);
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

    .guestBlock {
      padding: rem(16);
      gap: rem(20);
    }

    .input {
      height: rem(48);
      font-size: rem(14);
    }

    .dropdown {
      height: rem(48);
      font-size: rem(14);
    }

    .addGuestButton {
      height: rem(48);
      font-size: rem(14);
    }

    .submitButton {
      height: rem(48);
      font-size: rem(16);
    }

    .securityDescription {
      font-size: rem(13);
    }
  }
</style>
