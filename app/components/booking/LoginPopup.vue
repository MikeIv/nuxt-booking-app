<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import type { LoginResponse } from "~/types/auth";
import type { ApiError } from "~/composables/useApi";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "switch-to-register": [];
  "switch-to-recovery": [email: string];
  "login-success": [];
}>();

const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  email: "",
  password: "",
});

const emailError = ref("");
const passwordError = ref("");
const apiError = ref<string | null>(null);
const showPassword = ref(false);

const loading = computed(() => authStore.loading);

const showRecoveryLink = computed(
  () => !!apiError.value && apiError.value !== "Пользователь не найден",
);

const validateForm = () => {
  let isValid = true;
  emailError.value = "";
  passwordError.value = "";
  apiError.value = null;

  if (!formData.value.email) {
    emailError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    emailError.value = "Введите корректный email";
    isValid = false;
  }

  if (!formData.value.password) {
    passwordError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (formData.value.password.length < 3) {
    passwordError.value = "Пароль должен содержать минимум 3 символов";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (import.meta.dev) {
    console.log("🔄 Начало входа...");
  }

  if (!validateForm()) {
    if (import.meta.dev) {
      console.log("❌ Валидация не пройдена");
    }
    return;
  }

  if (import.meta.dev) {
    console.log("✅ Валидация пройдена, данные:", formData.value);
  }

  apiError.value = null;
  authStore.setLoading(true);
  authStore.setError(null);

  try {
    if (import.meta.dev) {
      console.log("📡 Отправка запроса на вход...");
    }

    const { post } = useApi();
    const response = await post<LoginResponse>(
      "/v1/auth/login",
      formData.value,
    );

    if (import.meta.dev) {
      console.log("📨 Ответ сервера:", response);
    }

    if (response.success && response.payload) {
      if (import.meta.dev) {
        console.log("✅ Успешный вход");
      }

      authStore.setToken(response.payload.accessToken);

      const userData = {
        id: response.payload.user?.id || 0,
        email: formData.value.email,
        name: response.payload.user?.name || "",
        surname: response.payload.user?.surname || "",
        phone: response.payload.user?.phone || "",
        country: response.payload.user?.country || "",
      };

      authStore.setUser(userData);
      authStore.setError(null);

      emit("login-success");
      emit("close");
      await router.push("/cabinet");
    } else {
      if (import.meta.dev) {
        console.log("❌ Ошибка в ответе:", response.message);
      }

      if (
        response.message?.includes("неверный пароль") ||
        response.message?.includes("invalid password") ||
        response.message?.includes("неверные учетные данные")
      ) {
        apiError.value = "Неверный email или пароль";
      } else if (
        response.message?.includes("пользователь не найден") ||
        response.message?.includes("user not found")
      ) {
        // Если пользователь не найден, предлагаем регистрацию
        apiError.value = "Пользователь не найден";
        emit("switch-to-register");
      } else {
        apiError.value = response.message || "Ошибка входа";
        authStore.setError(apiError.value);
      }
    }
  } catch (err: unknown) {
    if (import.meta.dev) {
      console.error("💥 Ошибка при входе:", err);
    }
    const apiErr = err as ApiError;
    const errorData = apiErr.data as { message?: string } | undefined;
    const errorMessage =
      errorData?.message || apiErr.message || "Произошла ошибка при входе";
    apiError.value = errorMessage;
    authStore.setError(errorMessage);
  } finally {
    authStore.setLoading(false);
  }
};

const handlePasswordRecovery = () => {
  emit("switch-to-recovery", formData.value.email);
};

const resetForm = () => {
  formData.value = {
    email: "",
    password: "",
  };
  emailError.value = "";
  passwordError.value = "";
  apiError.value = null;
  showPassword.value = false;
  authStore.setError(null);
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(() => {
        resetForm();
        if (import.meta.dev) {
          nextTick(() => {
            formData.value.email = "test@test.ru";
            formData.value.password = "1234567890";
          });
        }
      });
    }
  },
);

defineExpose({
  resetForm,
});
</script>

<template>
  <UiAuthPopup
    :visible="visible"
    header="Вход в личный кабинет"
    @close="$emit('close')"
  >
    <template #content>
      <form
        id="login-form"
        novalidate
        :class="$style.content"
        @submit.prevent="handleLogin"
      >
        <div :class="$style.inputBlock">
          <label for="email" :class="$style.srOnly">Почта</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Почта"
            autocomplete="email"
            aria-required="true"
            :class="[$style.input, { [$style.inputError]: emailError }]"
          />
          <small v-if="emailError" :class="$style.errorText">{{
            emailError
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <label for="password" :class="$style.srOnly">Пароль</label>
          <div
            :class="[
              $style.passwordWrapper,
              { [$style.inputError]: passwordError },
            ]"
          >
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Пароль"
              autocomplete="current-password"
              aria-required="true"
              :class="$style.passwordInput"
            />
            <button
              type="button"
              :class="$style.togglePassword"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-eye-off' : 'i-eye'"
                :class="$style.eyeIcon"
                aria-hidden="true"
              />
            </button>
          </div>
          <small v-if="passwordError" :class="$style.errorText">{{
            passwordError
          }}</small>
        </div>

        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
        </div>

        <button
          v-if="showRecoveryLink"
          type="button"
          :class="$style.recoveryLink"
          @click="handlePasswordRecovery"
        >
          Восстановить пароль?
        </button>
      </form>
    </template>

    <template #footer>
      <div :class="$style.btnGroup">
        <Button
          type="submit"
          form="login-form"
          label="Войти"
          unstyled
          class="btn__bs dark"
          :class="$style.button"
          :loading="loading"
          :disabled="loading"
        />
        <Button
          type="button"
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

<style module lang="scss">
.content {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  width: 100%;
  padding-bottom: rem(24);
  border-bottom: rem(1) solid var(--a-border-dark);
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
    border-color: var(--a-border-accent);
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
  flex-shrink: 0;
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

.recoveryLink {
  align-self: center;
  padding: 0;
  border: none;
  background: transparent;
  font-size: rem(14);
  line-height: 1.4;
  color: var(--a-text-dark);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: var(--a-accentBg);
  }
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

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Стили для автозаполнения браузера
// Примечание: !important требуется для переопределения встроенных стилей браузера
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
