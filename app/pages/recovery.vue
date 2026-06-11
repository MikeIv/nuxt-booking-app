<script setup lang="ts">
import type { ApiError } from "~/composables/useApi";
import type { ResetPasswordRequest } from "~/types/auth";
import { useNotificationToast } from "~/composables/useToast";
import { getRouteQueryString } from "~/utils/routeQuery";

definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Восстановление пароля",
  description: "Установка нового пароля для личного кабинета Varvarka",
});

const route = useRoute();
const router = useRouter();
const toast = useNotificationToast();

const formData = ref<
  Pick<ResetPasswordRequest, "password" | "password_confirmation">
>({
  password: "",
  password_confirmation: "",
});

const passwordError = ref("");
const passwordConfirmationError = ref("");
const apiError = ref<string | null>(null);
const loading = ref(false);
const isSuccess = ref(false);
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const recoveryEmail = computed(() =>
  getRouteQueryString(route.query, "email"),
);

const recoveryToken = computed(() =>
  getRouteQueryString(route.query, "token"),
);

const hasValidQuery = computed(
  () => recoveryEmail.value !== null && recoveryToken.value !== null,
);

const validateForm = (): boolean => {
  let isValid = true;
  passwordError.value = "";
  passwordConfirmationError.value = "";
  apiError.value = null;

  if (!formData.value.password) {
    passwordError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (formData.value.password.length < 3) {
    passwordError.value = "Пароль должен содержать минимум 3 символов";
    isValid = false;
  }

  if (!formData.value.password_confirmation) {
    passwordConfirmationError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (formData.value.password_confirmation !== formData.value.password) {
    passwordConfirmationError.value = "Пароли не совпадают";
    isValid = false;
  }

  return isValid;
};

const handleResetPassword = async () => {
  if (!hasValidQuery.value || !recoveryEmail.value || !recoveryToken.value) {
    apiError.value = "Ссылка для восстановления пароля недействительна";
    return;
  }

  if (!validateForm()) return;

  loading.value = true;
  apiError.value = null;

  try {
    const { post } = useApi();
    const body: ResetPasswordRequest = {
      email: recoveryEmail.value,
      token: recoveryToken.value,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
    };
    const response = await post("/v1/auth/password/reset", body);

    if (response.success) {
      isSuccess.value = true;
      toast.add({
        severity: "success",
        summary: "Пароль изменён",
        detail: response.message || "Теперь вы можете войти с новым паролем",
        life: 5000,
      });
    } else {
      apiError.value = response.message || "Не удалось изменить пароль";
    }
  } catch (err: unknown) {
    const apiErr = err as ApiError;
    const errorData = apiErr.data as { message?: string } | undefined;
    apiError.value =
      errorData?.message ||
      apiErr.message ||
      "Произошла ошибка при смене пароля";
  } finally {
    loading.value = false;
  }
};

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <main :class="$style.container">
    <h1 :class="$style.header" data-breadcrumb="Восстановление пароля">
      Восстановление пароля
    </h1>

    <section :class="$style.contentBlock">
      <div v-if="!hasValidQuery" :class="$style.messageBlock">
        <p :class="$style.messageText">
          Ссылка для восстановления пароля недействительна или устарела.
          Запросите восстановление пароля повторно.
        </p>
        <Button
          label="На главную"
          unstyled
          class="btn__bs dark"
          @click="goToHome"
        />
      </div>

      <div v-else-if="isSuccess" :class="$style.messageBlock">
        <p :class="$style.messageText">
          Пароль успешно изменён. Теперь вы можете войти в личный кабинет с
          новым паролем.
        </p>
        <Button
          label="На главную"
          unstyled
          class="btn__bs dark"
          @click="goToHome"
        />
      </div>

      <form
        v-else
        id="reset-password-form"
        novalidate
        :class="$style.form"
        @submit.prevent="handleResetPassword"
      >
        <p :class="$style.description">
          Введите новый пароль для аккаунта
          <strong>{{ recoveryEmail }}</strong>
        </p>

        <div :class="$style.inputBlock">
          <label for="password" :class="$style.srOnly">Новый пароль</label>
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
              placeholder="Новый пароль"
              autocomplete="new-password"
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

        <div :class="$style.inputBlock">
          <label for="password_confirmation" :class="$style.srOnly"
            >Повторить пароль</label
          >
          <div
            :class="[
              $style.passwordWrapper,
              { [$style.inputError]: passwordConfirmationError },
            ]"
          >
            <input
              id="password_confirmation"
              v-model="formData.password_confirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="Повторить пароль"
              autocomplete="new-password"
              aria-required="true"
              :class="$style.passwordInput"
            />
            <button
              type="button"
              :class="$style.togglePassword"
              :aria-label="
                showPasswordConfirm ? 'Скрыть пароль' : 'Показать пароль'
              "
              @click="showPasswordConfirm = !showPasswordConfirm"
            >
              <UIcon
                :name="showPasswordConfirm ? 'i-eye-off' : 'i-eye'"
                :class="$style.eyeIcon"
                aria-hidden="true"
              />
            </button>
          </div>
          <small v-if="passwordConfirmationError" :class="$style.errorText">{{
            passwordConfirmationError
          }}</small>
        </div>

        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
        </div>

        <Button
          type="submit"
          form="reset-password-form"
          label="Сохранить пароль"
          unstyled
          class="btn__bs dark"
          :class="$style.submitButton"
          :loading="loading"
          :disabled="loading"
        />
      </form>
    </section>
  </main>
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
  text-align: center;
  margin: rem(24) rem(16);
  font-family: var(--a-font-heading);
  font-size: rem(28);
  font-weight: 600;
  line-height: 1.3;
  color: var(--a-text-dark);

  @media (min-width: #{size.$tablet}) {
    font-size: rem(30);
    margin: rem(32) 0;
  }

  @media (min-width: #{size.$desktopMin}) {
    font-size: rem(34);
    margin: rem(40) 0;
  }
}

.contentBlock {
  width: 100%;
  max-width: rem(520);
  margin: 0 auto;
  padding: rem(16);

  @media (min-width: #{size.$tablet}) {
    padding: rem(16) rem(24);
  }
}

.form,
.messageBlock {
  display: flex;
  flex-direction: column;
  gap: rem(16);
}

.description,
.messageText {
  margin: 0;
  font-size: rem(16);
  line-height: 1.5;
  color: var(--a-text-dark);
}

.inputBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
}

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
  padding: rem(8) rem(12);
  background-color: var(--a-mainBg);
  border: 1px solid var(--a-border-accent);
  border-radius: var(--a-borderR--input);
  color: var(--a-text-accent);
  font-size: rem(14);
  text-align: center;
}

.submitButton {
  width: 100%;
  height: rem(48);
  margin-top: rem(8);
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
</style>
