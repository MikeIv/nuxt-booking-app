<template>
  <UiAuthPopup
    :visible="visible"
    header="Вход в личный кабинет"
    @close="$emit('close')"
  >
    <template #content>
      <section :class="$style.content">
        <div :class="$style.inputBlock">
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Почта"
            :class="[$style.input, { [$style.inputError]: emailError }]"
          />
          <small v-if="emailError" :class="$style.errorText">{{
            emailError
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <div
            :class="[
              $style.passwordWrapper,
              { [$style.inputError]: passwordError },
            ]"
          >
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Пароль"
              :class="$style.passwordInput"
            />
            <button
              type="button"
              :class="$style.togglePassword"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-eye-slash' : 'i-eye'"
                :class="$style.eyeIcon"
              />
            </button>
          </div>
          <small v-if="passwordError" :class="$style.errorText">{{
            passwordError
          }}</small>
        </div>
      </section>
    </template>

    <template #footer>
      <div :class="$style.btnGroup">
        <Button
          label="Войти"
          unstyled
          class="btn__bs dark"
          :class="$style.button"
          :loading="loading"
          @click="handleLogin"
        />
        <Button
          label="Зарегистрироваться"
          severity="secondary"
          unstyled
          class="btn__bs dark"
          :class="$style.button"
          @click="$emit('switch-to-register')"
        />
      </div>
    </template>
  </UiAuthPopup>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  defineProps<{
    visible: boolean;
  }>();

  defineEmits<{
    close: [];
    "switch-to-register": [];
    "switch-to-recovery": [email: string];
  }>();

  const email = ref("");
  const password = ref("");
  const emailError = ref("");
  const passwordError = ref("");
  const loading = ref(false);
  const showPassword = ref(false);

  const validateForm = () => {
    let isValid = true;
    emailError.value = "";
    passwordError.value = "";

    if (!email.value) {
      emailError.value = "Поле обязательно для заполнения";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      emailError.value = "Введите корректный email";
      isValid = false;
    }

    if (!password.value) {
      passwordError.value = "Поле обязательно для заполнения";
      isValid = false;
    } else if (password.value.length < 6) {
      passwordError.value = "Пароль должен содержать минимум 6 символов";
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    loading.value = true;

    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Симуляция неправильных данных
      const isInvalidCredentials =
        email.value === "test@example.com" &&
        password.value === "wrongpassword";

      if (isInvalidCredentials) {
        // Эмитируем событие для перехода к восстановлению пароля
        defineEmits().emit("switch-to-recovery", email.value);
        return;
      }

      // Успешный вход
      console.log("Успешный вход:", { email: email.value });
      defineEmits().emit("close");
    } catch (error) {
      console.error("Ошибка входа:", error);
    } finally {
      loading.value = false;
    }
  };

  // Сброс формы при открытии
  defineExpose({
    resetForm: () => {
      email.value = "";
      password.value = "";
      emailError.value = "";
      passwordError.value = "";
      showPassword.value = false;
    },
  });
</script>

<style module lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-bottom: rem(1) solid var(--a-border-dark);
  }

  .inputBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: rem(16);
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

  .errorText {
    display: block;
    margin-top: rem(4);
    color: var(--a-error);
    font-size: rem(12);
    line-height: 1.2;
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

  .buttonPrimary {
    background-color: var(--a-accentBg);
    color: var(--a-white);

    &:hover:not(:disabled) {
      background-color: var(--a-accentDark);
    }
  }

  .buttonSecondary {
    background-color: transparent;
    border-color: var(--a-border-dark);
    color: var(--a-text-dark);

    &:hover:not(:disabled) {
      background-color: var(--a-bg-light);
      border-color: var(--a-text-dark);
    }
  }

  // Стили для автозаполнения
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    box-shadow: 0 0 0 30px white inset !important;
    border-radius: var(--a-borderR--input);
    -webkit-text-fill-color: var(--a-text-dark) !important;
  }
</style>
