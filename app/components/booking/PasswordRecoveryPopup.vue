<template>
  <UiAuthPopup
    :visible="visible"
    header="Восстановление пароля"
    @close="$emit('close')"
  >
    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-600">
          Введите вашу почту для восстановления пароля
        </p>

        <div class="flex flex-col gap-2">
          <label for="recovery-email" class="font-medium">Почта</label>
          <InputText
            id="recovery-email"
            v-model="email"
            type="email"
            placeholder="Введите вашу почту"
            class="w-full"
            :class="{ 'p-invalid': emailError }"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <Button
          label="Восстановить"
          class="flex-1"
          :loading="loading"
          @click="handleRecovery"
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

  const props = defineProps<{
    visible: boolean;
    initialEmail?: string;
  }>();

  defineEmits<{
    close: [];
    "switch-to-login": [];
  }>();

  const email = ref("");
  const emailError = ref("");
  const loading = ref(false);

  // Устанавливаем начальный email если передан
  if (props.initialEmail) {
    email.value = props.initialEmail;
  }

  const validateForm = () => {
    let isValid = true;
    emailError.value = "";

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

    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Запрос на восстановление отправлен:", {
        email: email.value,
      });
      // Здесь можно показать сообщение об успехе
      defineEmits().emit("close");
    } catch (error) {
      console.error("Ошибка восстановления:", error);
    } finally {
      loading.value = false;
    }
  };

  // Сброс формы при открытии
  defineExpose({
    resetForm: () => {
      email.value = props.initialEmail || "";
      emailError.value = "";
    },
  });
</script>
