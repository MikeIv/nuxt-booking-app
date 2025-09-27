<script setup lang="ts">
  import type { RegisterData } from "~/types/auth";

  const props = defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
    "switch-to-login": [];
    "registration-success": [];
  }>();

  const authStore = useAuthStore();

  const formData = ref<RegisterData>({
    name: "",
    surname: "",
    middle_name: null,
    phone: "",
    email: "",
    country: "",
    password: "",
    password_confirmation: "",
  });

  const errors = ref<Record<string, string>>({});
  const agreeTerms = ref(false);
  const showPassword = ref(false);
  const apiError = ref<string | null>(null);

  const loading = computed(() => authStore.loading);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Обязательные поля
    if (!formData.value.surname.trim()) {
      newErrors.surname = "Фамилия обязательна";
    } else if (formData.value.surname.length > 255) {
      newErrors.surname = "Фамилия не должна превышать 255 символов";
    }

    if (!formData.value.name.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (formData.value.name.length > 255) {
      newErrors.name = "Имя не должно превышать 255 символов";
    }

    if (formData.value.middle_name && formData.value.middle_name.length > 255) {
      newErrors.middle_name = "Отчество не должно превышать 255 символов";
    }

    if (!formData.value.phone.trim()) {
      newErrors.phone = "Телефон обязателен";
    } else if (formData.value.phone.length > 32) {
      newErrors.phone = "Телефон не должен превышать 32 символа";
    } else if (!/^[+]?[0-9\s\-()]{10,}$/.test(formData.value.phone)) {
      newErrors.phone = "Введите корректный телефон";
    }

    if (!formData.value.email.trim()) {
      newErrors.email = "Почта обязательна";
    } else if (formData.value.email.length > 255) {
      newErrors.email = "Почта не должна превышать 255 символов";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.value.country.trim()) {
      newErrors.country = "Страна обязательна";
    } else if (formData.value.country.length > 255) {
      newErrors.country = "Страна не должна превышать 255 символов";
    }

    if (!formData.value.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.value.password.length < 2) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (!formData.value.password_confirmation) {
      newErrors.password_confirmation = "Подтвердите пароль";
    } else if (
      formData.value.password !== formData.value.password_confirmation
    ) {
      newErrors.password_confirmation = "Пароли не совпадают";
    }

    if (!agreeTerms.value) {
      newErrors.agreeTerms = "Необходимо согласие с правилами";
    }

    errors.value = newErrors;
    apiError.value = null;
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log("🔄 Начало регистрации...");

    if (!validateForm()) {
      console.log("❌ Валидация не пройдена");
      return;
    }

    console.log("✅ Валидация пройдена, данные:", formData.value);

    apiError.value = null;
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      console.log("📡 Отправка запроса на регистрацию...");

      const { post } = useApi();
      const response = await post("/auth/register", formData.value);

      console.log("📨 Ответ сервера:", response);

      if (response.success && response.payload) {
        console.log("✅ Успешная регистрация");

        authStore.setToken(response.payload.accessToken);

        const userData = {
          id: "",
          email: formData.value.email,
          name: formData.value.name,
          surname: formData.value.surname,
          phone: formData.value.phone,
          country: formData.value.country,
        };

        authStore.setUser(userData);
        authStore.setError(null);

        emit("registration-success");
        emit("close");
      } else {
        console.log("❌ Ошибка в ответе:", response.message);
        apiError.value = response.message || "Ошибка регистрации";
        authStore.setError(apiError.value);
      }
    } catch (err: unknown) {
      console.error("💥 Ошибка при регистрации:", err);
      const errorMessage =
        err.data?.message || err.message || "Произошла ошибка при регистрации";
      apiError.value = errorMessage;
      authStore.setError(errorMessage);
    } finally {
      authStore.setLoading(false);
    }
  };

  const resetForm = () => {
    formData.value = {
      name: "",
      surname: "",
      middle_name: null,
      phone: "",
      email: "",
      country: "",
      password: "",
      password_confirmation: "",
    };
    agreeTerms.value = false;
    errors.value = {};
    apiError.value = null;
    authStore.setError(null);
  };

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        resetForm();
      }
    },
  );

  defineExpose({ resetForm });
</script>

<template>
  <UiAuthPopup :visible="visible" header="Регистрация" @close="$emit('close')">
    <template #content>
      <section :class="$style.content">
        <div :class="$style.inputRow">
          <div :class="$style.inputBlock">
            <input
              id="lastName"
              v-model="formData.surname"
              type="text"
              placeholder="Фамилия"
              :class="[$style.input, { [$style.inputError]: errors.surname }]"
            />
            <small v-if="errors.surname" :class="$style.errorText">{{
              errors.surname
            }}</small>
          </div>

          <div :class="$style.inputBlock">
            <input
              id="firstName"
              v-model="formData.name"
              type="text"
              placeholder="Имя"
              :class="[$style.input, { [$style.inputError]: errors.name }]"
            />
            <small v-if="errors.name" :class="$style.errorText">{{
              errors.name
            }}</small>
          </div>
        </div>

        <div :class="$style.inputBlock">
          <input
            id="middleName"
            v-model="formData.middle_name"
            type="text"
            placeholder="Отчество (необязательно)"
            :class="[$style.input]"
          />
        </div>

        <div :class="$style.inputBlock">
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Телефон"
            :class="[$style.input, { [$style.inputError]: errors.phone }]"
          />
          <small v-if="errors.phone" :class="$style.errorText">{{
            errors.phone
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Почта"
            :class="[$style.input, { [$style.inputError]: errors.email }]"
          />
          <small v-if="errors.email" :class="$style.errorText">{{
            errors.email
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <input
            id="country"
            v-model="formData.country"
            type="text"
            placeholder="Страна"
            :class="[$style.input, { [$style.inputError]: errors.country }]"
          />
          <small v-if="errors.country" :class="$style.errorText">{{
            errors.country
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <div :class="$style.passwordWrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Пароль"
              :class="[
                $style.passwordInput,
                { [$style.inputError]: errors.password },
              ]"
            />
            <button
              type="button"
              :class="$style.togglePassword"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                :class="$style.eyeIcon"
              />
            </button>
          </div>
          <small v-if="errors.password" :class="$style.errorText">{{
            errors.password
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <div :class="$style.passwordWrapper">
            <input
              id="password_confirmation"
              v-model="formData.password_confirmation"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Повторить пароль"
              :class="[
                $style.passwordInput,
                { [$style.inputError]: errors.password_confirmation },
              ]"
            />
          </div>
          <small
            v-if="errors.password_confirmation"
            :class="$style.errorText"
            >{{ errors.password_confirmation }}</small
          >
        </div>

        <div :class="$style.checkboxBlock">
          <label :class="$style.checkboxLabel">
            <input
              v-model="agreeTerms"
              type="checkbox"
              :class="$style.checkbox"
            />
            <span :class="$style.checkboxText">
              Я даю согласие с&nbsp;правилами
              онлайн-бронирования,&nbsp;обработкой персональных данных
              и&nbsp;политикой конфиденциальности
            </span>
          </label>
          <small v-if="errors.agreeTerms" :class="$style.errorText">{{
            errors.agreeTerms
          }}</small>
        </div>

        <!-- Сообщение об ошибке из API -->
        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
        </div>
      </section>
    </template>

    <template #footer>
      <div :class="$style.btnGroup">
        <Button
          label="Зарегистрироваться"
          severity="secondary"
          unstyled
          class="btn__bs dark"
          :class="$style.button"
          :loading="loading"
          :disabled="loading"
          @click="handleRegister"
        />
      </div>
    </template>
  </UiAuthPopup>
</template>

<style module lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-bottom: rem(1) solid var(--a-border-dark);
    gap: rem(16);
  }

  .inputRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: rem(12);
  }

  .inputBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .input,
  .passwordWrapper {
    position: relative;
    display: flex;
    width: 100%;
    height: rem(58);
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--input);
    transition: border-color 0.3s ease;

    &:focus-within {
      border-color: var(--a-accentBg);
      outline: none;
    }

    &.inputError {
      border-color: var(--a-error);
    }
  }

  .input {
    padding: 0 rem(16);
    font-size: rem(16);
    color: var(--a-text-dark);

    &::placeholder {
      color: var(--a-text-light);
    }

    &:focus {
      outline: none;
    }
  }

  .passwordWrapper {
    padding: 0;
  }

  .passwordInput {
    flex: 1;
    padding: 0 rem(16);
    border: none;
    background: transparent;
    font-size: rem(16);
    color: var(--a-text-dark);

    &::placeholder {
      color: var(--a-text-light);
    }

    &:focus {
      outline: none;
    }
  }

  .togglePassword {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(50);
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--a-text-dark);
    transition: color 0.3s ease;

    &:hover {
      color: var(--a-accentBg);
    }
  }

  .eyeIcon {
    width: rem(20);
    height: rem(20);
  }

  .checkboxBlock {
    margin-top: rem(8);
  }

  .checkboxLabel {
    display: flex;
    align-items: flex-start;
    gap: rem(8);
    cursor: pointer;
  }

  .checkbox {
    margin-top: rem(4);
    width: rem(18);
    height: rem(18);
    accent-color: var(--a-accentBg);
  }

  .checkboxText {
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-dark);
  }

  .errorText {
    display: block;
    margin-top: rem(4);
    color: var(--a-text-accent);
    font-size: rem(12);
    line-height: 1.2;
  }

  .apiError {
    margin-top: rem(8);
    padding: rem(8) rem(12);
    background-color: var(--a-mainBg);
    border: 1px solid var(--a-border-accent);
    border-radius: var(--a-borderR--input);
    color: var(--a-text-accent);
    font-size: rem(14);
    text-align: center;
  }

  .btnGroup {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: rem(24);
    gap: rem(12);
  }

  .button {
    flex: 1;
    height: rem(48);
    padding: 0 rem(16);
    border: rem(1) solid transparent;
    border-radius: var(--a-borderR--input);
    font-size: rem(16);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    .inputRow {
      grid-template-columns: 1fr;
      gap: rem(16);
    }
  }
</style>
