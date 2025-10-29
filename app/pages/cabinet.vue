<template>
  <div :class="$style.cabinet">
    <div :class="$style.container">
      <!-- Блок с кнопками -->
      <div :class="$style.nav">
        <Button
          unstyled
          label="Личные данные"
          class="btn__bs dark"
          :class="$style.navBtn"
          @click="activeSection = 'personal'"
        />

        <Button
          unstyled
          label="Мои бронирования"
          class="btn__bs dark"
          :class="$style.navBtn"
          @click="activeSection = 'bookings'"
        />
        <Button
          unstyled
          label="Прошлые бронирования"
          class="btn__bs dark"
          :class="$style.navBtn"
          @click="activeSection = 'history'"
        />
        <Button
          unstyled
          label="Новое бронирование"
          class="btn__bs dark"
          :class="$style.navBtn"
          @click="activeSection = 'new'"
        />
        <Button
          unstyled
          label=" Выйти"
          class="btn__bs dark"
          :class="[$style.navBtn, $style.logout]"
          @click="handleLogout"
        />
      </div>

      <!-- Личные данные -->
      <div v-if="activeSection === 'personal'" :class="$style.content">
        <div :class="$style.form">
          <div :class="$style.field">
            <label :class="$style.label">Имя</label>
            <input
              v-model="formData.name"
              :class="$style.input"
              type="text"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :class="$style.label">Фамилия</label>
            <input
              v-model="formData.surname"
              :class="$style.input"
              type="text"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :class="$style.label">Телефон</label>
            <input
              v-model="formData.phone"
              :class="$style.input"
              type="tel"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :class="$style.label">E-mail</label>
            <input
              v-model="formData.email"
              :class="$style.input"
              type="email"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :class="$style.label">Гражданство</label>
            <input
              v-model="formData.country"
              :class="$style.input"
              type="text"
              @input="checkChanges"
            >
          </div>

          <Button
            label="Изменить"
            unstyled
            class="btn__bs dark"
            :class="[$style.saveBtn, hasChanges ? $style.active : '']"
            :disabled="!hasChanges"
            @click="saveChanges"
          />
        </div>
      </div>

      <!-- Другие секции -->
      <div v-if="activeSection === 'bookings'" :class="$style.content">
        <h2>Мои бронирования</h2>
      </div>

      <div v-if="activeSection === 'history'" :class="$style.content">
        <h2>Прошлые бронирования</h2>
      </div>

      <div v-if="activeSection === 'new'" :class="$style.content">
        <h2>Новое бронирование</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from "vue-router";
  import { useAuthStore } from "~/stores/auth";

  const router = useRouter();
  console.log("router", router);
  const authStore = useAuthStore();

  const activeSection = ref("personal");
  const hasChanges = ref(false);

  const originalData = reactive({
    name: "",
    surname: "",
    phone: "",
    email: "",
    country: "",
  });

  const formData = reactive({
    name: "",
    surname: "",
    phone: "",
    email: "",
    country: "",
  });

  onMounted(() => {
    if (authStore.user) {
      Object.assign(originalData, {
        name: authStore.user.name || "",
        surname: authStore.user.surname || "",
        phone: authStore.user.phone || "",
        email: authStore.user.email || "",
        country: authStore.user.country || "",
      });
      Object.assign(formData, originalData);
    }
  });

  const checkChanges = () => {
    hasChanges.value = Object.keys(originalData).some(
      (key) => formData[key] !== originalData[key],
    );
  };

  const saveChanges = () => {
    if (!authStore.user) return;

    const updatedUser = { ...authStore.user, ...formData };
    authStore.setUser(updatedUser);

    Object.assign(originalData, formData);
    hasChanges.value = false;

    console.log("Данные сохранены:", updatedUser);
  };

  const handleLogout = async () => {
    console.log("🔄 Начало выхода...");

    authStore.setLoading(true);
    authStore.setError(null);

    try {
      console.log("📡 Отправка запроса на выход...");

      const { post } = useApi();
      const response = await post("/auth/logout");

      console.log("📨 Ответ сервера:", response);

      if (response.success) {
        console.log("✅ Успешный выход");
        authStore.logout();
      } else {
        console.log("❌ Ошибка в ответе:", response.message);
        authStore.logout();
      }
    } catch (err: unknown) {
      console.error("💥 Ошибка при выходе:", err);
      // Даже при ошибке очищаем локальные данные
      authStore.logout();
    } finally {
      authStore.setLoading(false);
    }
  };
</script>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cabinet {
    margin: 0 auto;
    padding: rem(20);
    max-width: rem(1200);
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: rem(30);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
    }
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: rem(10);
    background: #fff;
    padding: rem(20);
    border-radius: rem(8);
    box-shadow: 0 rem(2) rem(4) rgba(0, 0, 0, 0.1);
  }

  .navBtn {
    &:hover {
      background: #e0e0e0;
    }
  }

  .logout {
    margin-top: rem(20);
    background: #ff4757;
    color: #fff;

    &:hover {
      background: #ff3742;
    }
  }

  .content {
    background: #fff;
    padding: rem(30);
    border-radius: rem(8);
    box-shadow: 0 rem(2) rem(4) rgba(0, 0, 0, 0.1);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    max-width: rem(400);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: rem(5);
  }

  .label {
    font-weight: 500;
    color: #333;
  }

  .input {
    padding: rem(10) rem(12);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: rem(1) solid #ddd;
    border-radius: rem(4);

    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }

  .saveBtn {
    cursor: not-allowed;
    transition: all 0.3s;
  }

  .active {
    background: #007bff;
    color: #fff;
    cursor: pointer;

    &:hover {
      background: #0056b3;
    }
  }
</style>
