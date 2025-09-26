<template>
  <UiAuthPopup :visible="visible" header="Регистрация" @close="$emit('close')">
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="reg-email" class="font-medium">Почта</label>
          <InputText
            id="reg-email"
            v-model="email"
            type="email"
            placeholder="Введите вашу почту"
            class="w-full"
            :class="{ 'p-invalid': emailError }"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="reg-password" class="font-medium">Пароль</label>
          <Password
            id="reg-password"
            v-model="password"
            placeholder="Введите ваш пароль"
            :feedback="true"
            toggle-mask
            class="w-full"
            :class="{ 'p-invalid': passwordError }"
          />
          <small v-if="passwordError" class="p-error">{{
            passwordError
          }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="confirm-password" class="font-medium"
            >Подтвердите пароль</label
          >
          <Password
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="Повторите пароль"
            :feedback="false"
            toggle-mask
            class="w-full"
            :class="{ 'p-invalid': confirmPasswordError }"
          />
          <small v-if="confirmPasswordError" class="p-error">{{
            confirmPasswordError
          }}</small>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <Button
          label="Зарегистрироваться"
          class="flex-1"
          :loading="loading"
          @click="handleRegister"
        />
        <Button
          label="Назад к входу"
          severity="secondary"
          class="flex-1"
          @click="$emit('switch-to-login')"
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
    "switch-to-login": [];
  }>();

  const email = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const emailError = ref("");
  const passwordError = ref("");
  const confirmPasswordError = ref("");
  const loading = ref(false);

  const validateForm = () => {
    let isValid = true;
    emailError.value = "";
    passwordError.value = "";
    confirmPasswordError.value = "";

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

    if (!confirmPassword.value) {
      confirmPasswordError.value = "Подтвердите пароль";
      isValid = false;
    } else if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = "Пароли не совпадают";
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    loading.value = true;

    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Успешная регистрация:", { email: email.value });
      defineEmits().emit("close");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
    } finally {
      loading.value = false;
    }
  };

  // Сброс формы при открытии
  defineExpose({
    resetForm: () => {
      email.value = "";
      password.value = "";
      confirmPassword.value = "";
      emailError.value = "";
      passwordError.value = "";
      confirmPasswordError.value = "";
    },
  });
</script>
