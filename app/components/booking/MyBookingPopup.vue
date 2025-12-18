<script setup lang="ts">
  const props = defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
    "login-success": [];
  }>();

  const router = useRouter();

  const formData = ref({
    bookingNumber: "",
    accessCode: "",
  });

  const bookingNumberError = ref("");
  const accessCodeError = ref("");
  const apiError = ref<string | null>(null);
  const loading = ref(false);

  // Статичный код доступа (временно, пока нет бэкенда)
  const STATIC_ACCESS_CODE = "1234";

  const validateForm = () => {
    let isValid = true;
    bookingNumberError.value = "";
    accessCodeError.value = "";
    apiError.value = null;

    if (!formData.value.bookingNumber.trim()) {
      bookingNumberError.value = "Поле обязательно для заполнения";
      isValid = false;
    }

    if (!formData.value.accessCode.trim()) {
      accessCodeError.value = "Поле обязательно для заполнения";
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    loading.value = true;
    apiError.value = null;

    try {
      // Временно используем статичную валидацию
      // TODO: Заменить на реальный API запрос, когда бэкенд будет готов
      if (formData.value.accessCode !== STATIC_ACCESS_CODE) {
        apiError.value = "Неверный номер бронирования или код доступа";
        loading.value = false;
        return;
      }

      // Симулируем задержку запроса
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Сохранить данные бронирования в store или sessionStorage
      // для отображения в личном кабинете
      
      // Сохраняем номер бронирования в sessionStorage для использования в кабинете
      if (typeof window !== "undefined") {
        sessionStorage.setItem("currentBookingNumber", formData.value.bookingNumber);
      }

      emit("login-success");
      emit("close");
      await router.push("/cabinet");
    } catch {
      apiError.value = "Произошла ошибка при входе. Попробуйте позже.";
    } finally {
      loading.value = false;
    }
  };

  const resetForm = () => {
    formData.value = {
      bookingNumber: "",
      accessCode: "",
    };
    bookingNumberError.value = "";
    accessCodeError.value = "";
    apiError.value = null;
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

  defineExpose({
    resetForm,
  });
</script>

<template>
  <UiAuthPopup :visible="visible" header="Моё бронирование" @close="$emit('close')">
    <template #content>
      <section :class="$style.content">
        <div :class="$style.inputBlock">
          <input
            id="bookingNumber"
            v-model="formData.bookingNumber"
            type="text"
            placeholder="Номер бронирования"
            :class="[$style.input, { [$style.inputError]: bookingNumberError }]"
          >
          <small v-if="bookingNumberError" :class="$style.errorText">{{
            bookingNumberError
          }}</small>
        </div>

        <div :class="$style.inputBlock">
          <input
            id="accessCode"
            v-model="formData.accessCode"
            type="text"
            placeholder="Код доступа"
            :class="[$style.input, { [$style.inputError]: accessCodeError }]"
          >
          <small v-if="accessCodeError" :class="$style.errorText">{{
            accessCodeError
          }}</small>
        </div>

        <div v-if="apiError" :class="$style.apiError">
          {{ apiError }}
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
          :disabled="loading"
          @click="handleLogin"
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

  .input {
    position: relative;
    display: flex;
    width: 100%;
    height: rem(58);
    padding: 0 rem(16);
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--input);
    font-size: rem(16);
    color: var(--a-text-dark);
    transition: border-color 0.3s ease;

    &::placeholder {
      color: var(--a-text-light);
    }

    &:focus {
      outline: none;
      border-color: var(--a-accentBg);
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
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: rem(24);
  }

  .button {
    width: 100%;
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

  // Стили для автозаполнения браузера
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

