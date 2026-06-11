<script setup lang="ts">
import type { ApiError } from "~/composables/useApi";
import type { ForgotPasswordRequest } from "~/types/auth";
import { useNotificationToast } from "~/composables/useToast";

const props = defineProps<{
  visible: boolean;
  initialEmail?: string;
}>();

defineEmits<{
  close: [];
  "switch-to-login": [];
}>();

const toast = useNotificationToast();

const email = ref("");
const emailError = ref("");
const apiError = ref<string | null>(null);
const loading = ref(false);
const isSuccess = ref(false);

const validateForm = (): boolean => {
  let isValid = true;
  emailError.value = "";
  apiError.value = null;

  if (!email.value) {
    emailError.value = "Поле обязательно для заполнения";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = "Введите корректный email";
    isValid = false;
  }

  return isValid;
};

const handleRecovery = async () => {
  if (!validateForm()) return;

  loading.value = true;
  apiError.value = null;

  try {
    const { post } = useApi();
    const body: ForgotPasswordRequest = { email: email.value };
    const response = await post("/v1/auth/password/forgot", body);

    if (response.success) {
      isSuccess.value = true;
      toast.add({
        severity: "success",
        summary: "Письмо отправлено",
        detail:
          response.message ||
          "Инструкции по восстановлению пароля отправлены на вашу почту",
        life: 5000,
      });
    } else {
      apiError.value =
        response.message || "Не удалось отправить письмо для восстановления";
    }
  } catch (err: unknown) {
    const apiErr = err as ApiError;
    const errorData = apiErr.data as { message?: string } | undefined;
    apiError.value =
      errorData?.message ||
      apiErr.message ||
      "Произошла ошибка при отправке запроса";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  email.value = props.initialEmail || "";
  emailError.value = "";
  apiError.value = null;
  isSuccess.value = false;
  loading.value = false;
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
  <UiAuthPopup
    :visible="visible"
    header="Восстановление пароля"
    @close="$emit('close')"
  >
    <template #content>
      <div v-if="isSuccess" :class="$style.content">
        <p :class="$style.successText">
          Инструкции по восстановлению пароля отправлены на
          <strong>{{ email }}</strong
          >. Проверьте почту и перейдите по ссылке из письма.
        </p>
      </div>

      <form
        v-else
        id="recovery-form"
        novalidate
        :class="$style.content"
        @submit.prevent="handleRecovery"
      >
        <p :class="$style.description">
          Введите вашу почту для восстановления пароля
        </p>

        <div :class="$style.inputBlock">
          <label for="recovery-email" :class="$style.srOnly">Почта</label>
          <input
            id="recovery-email"
            v-model="email"
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

        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
        </div>
      </form>
    </template>

    <template #footer>
      <div :class="$style.btnGroup">
        <Button
          v-if="isSuccess"
          type="button"
          label="Назад к входу"
          unstyled
          class="btn__bs dark"
          :class="$style.button"
          @click="$emit('switch-to-login')"
        />
        <template v-else>
          <Button
            type="submit"
            form="recovery-form"
            label="Восстановить"
            unstyled
            class="btn__bs dark"
            :class="$style.button"
            :loading="loading"
            :disabled="loading"
          />
          <Button
            type="button"
            label="Назад к входу"
            severity="secondary"
            unstyled
            class="btn__bs dark"
            :class="$style.button"
            @click="$emit('switch-to-login')"
          />
        </template>
      </div>
    </template>
  </UiAuthPopup>
</template>

<style module lang="scss">
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: rem(16);
}

.description,
.successText {
  margin: 0;
  font-size: rem(16);
  line-height: 1.4;
  color: var(--a-text-dark);
}

.inputBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input {
  display: flex;
  width: 100%;
  height: rem(58);
  padding: 0 rem(16);
  font-size: rem(16);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  border: rem(1) solid var(--a-border-dark);
  border-radius: var(--a-borderR--input);
  transition: border-color 0.3s ease;

  &::placeholder {
    color: var(--a-text-light);
  }

  &:focus {
    border-color: var(--a-accentBg);
    outline: none;
  }

  &.inputError {
    border-color: var(--a-border-accent);
  }
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
}
</style>
