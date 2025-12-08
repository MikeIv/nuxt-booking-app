<script setup lang="ts">
  import { useAuthStore } from "~/stores/auth";
  import { useBookingStore } from "~/stores/booking";
  import { countriesRu } from "~/utils/countries";
  import { useNotificationToast } from "~/composables/useToast";

  const router = useRouter();
  const authStore = useAuthStore();
  const bookingStore = useBookingStore();
  const toast = useNotificationToast();

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

  watch(
    () => authStore.user,
    (user) => {
      if (!user) return;
      const saved = bookingStore.getUserProfile(user.id);
      const source = saved || {
        name: user.name || "",
        surname: user.surname || "",
        phone: user.phone || "",
        email: user.email || "",
        country: user.country || "",
      };
      Object.assign(originalData, source);
      Object.assign(formData, originalData);
      hasChanges.value = false;
    },
  );

  const checkChanges = () => {
    const keys = Object.keys(originalData) as Array<keyof typeof originalData>;
    hasChanges.value = keys.some((key) => formData[key] !== originalData[key]);
  };

  const saveChanges = () => {
    if (!authStore.user) return;

    const updatedUser = { ...authStore.user, ...formData };
    authStore.setUser(updatedUser);

    bookingStore.saveUserProfile(authStore.user.id, {
      name: formData.name,
      surname: formData.surname,
      phone: formData.phone,
      email: formData.email,
      country: formData.country,
    });

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
      const response = await post("/v1/auth/logout");

      console.log("📨 Ответ сервера:", response);

      if (response.success) {
        console.log("✅ Успешный выход");
        authStore.logout();
        router.push("/");
      } else {
        console.log("❌ Ошибка в ответе:", response.message);
        authStore.logout();
        toast.add({
          severity: "error",
          summary: "Ошибка выхода",
          detail:
            response.message || "Не удалось выполнить выход. Попробуйте позже.",
          life: 5000,
        });
        router.push("/");
      }
    } catch (err: unknown) {
      console.error("💥 Ошибка при выходе:", err);
      authStore.logout();
      const message =
        (err as { message?: string })?.message ||
        "Не удалось выполнить выход. Попробуйте позже.";
      toast.add({
        severity: "error",
        summary: "Ошибка выхода",
        detail: message,
        life: 5000,
      });
      router.push("/");
    } finally {
      authStore.setLoading(false);
    }
  };

  onMounted(() => {
    if (authStore.user) {
      const saved = bookingStore.getUserProfile(authStore.user.id);
      const source = saved || {
        name: authStore.user.name || "",
        surname: authStore.user.surname || "",
        phone: authStore.user.phone || "",
        email: authStore.user.email || "",
        country: authStore.user.country || "",
      };
      Object.assign(originalData, source);
      Object.assign(formData, originalData);
    }
  });
</script>

<template>
  <div :class="$style.cabinet">
    <h1 :class="$style.header">Личный кабинет</h1>
    <div :class="$style.container">
      <div :class="$style.navBlock">
        <Button
          unstyled
          label="Личные данные"
          :class="[
            $style.navBtn,
            activeSection === 'personal'
              ? $style.navBtnActive
              : $style.navBtnInactive,
          ]"
          @click="activeSection = 'personal'"
        />

        <Button
          unstyled
          label="Мои бронирования"
          :class="[
            $style.navBtn,
            activeSection === 'bookings'
              ? $style.navBtnActive
              : $style.navBtnInactive,
          ]"
          @click="activeSection = 'bookings'"
        />
        <Button
          unstyled
          label="Новое бронирование"
          :class="[
            $style.navBtn,
            activeSection === 'new'
              ? $style.navBtnActive
              : $style.navBtnInactive,
          ]"
          @click="activeSection = 'new'"
        />
        <Button
          unstyled
          label=" Выйти"
          class="btn__bs"
          :class="$style.navBtnExit"
          @click="handleLogout"
        />
      </div>

      <!-- Личные данные -->
      <div v-if="activeSection === 'personal'" :class="$style.content">
        <div :class="$style.form">
          <div :class="$style.field">
            <label :for="'name'" :class="$style.label">Имя</label>
            <input
              id="name"
              v-model="formData.name"
              :class="$style.input"
              type="text"
              placeholder="Введите имя"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :for="'surname'" :class="$style.label">Фамилия</label>
            <input
              id="surname"
              v-model="formData.surname"
              :class="$style.input"
              type="text"
              placeholder="Введите фамилию"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :for="'phone'" :class="$style.label">Телефон</label>
            <input
              id="phone"
              v-model="formData.phone"
              :class="$style.input"
              type="tel"
              placeholder="Введите телефон"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :for="'email'" :class="$style.label">E-mail</label>
            <input
              id="email"
              v-model="formData.email"
              :class="$style.input"
              type="email"
              placeholder="Введите e-mail"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label :class="$style.label">Гражданство</label>
            <BookingSelect
              v-model="formData.country"
              :options="countriesRu"
              :searchable="true"
              search-placeholder="Поиск страны..."
              :class="$style.input"
              @update:model-value="checkChanges"
            />
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

      <div v-if="activeSection === 'bookings'" :class="$style.content">
        <h2>Мои бронирования</h2>
        <div :class="$style.bookingCard">
          <div :class="$style.bookingTitle">Ваше бронирование № 0001</div>
          <div :class="$style.bookingDates">24.11.2025 - 24.11.2025</div>
          <div :class="$style.bookingRooms">Количество номеров: 1</div>
          <Button unstyled label="Подробнее" :class="$style.moreBtn" />
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cabinet {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto rem(40);
    padding: rem(20);

    @media (min-width: #{size.$desktopMax}) {
      max-width: #{size.$desktopMax};
    }
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(34);
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: rem(40);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      max-width: #{size.$desktopMax};
    }

    @media (min-width: #{size.$desktopMax}) {
      justify-content: flex-start;
    }
  }

  .navBlock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(20);
    width: 100%;

    @media (min-width: #{size.$desktopMax}) {
      max-width: rem(700);
    }
  }

  .navBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: rem(440);
    min-height: rem(44);

    padding: rem(10) rem(16);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    line-height: 1.2;
    border-radius: var(--a-borderR--btn);
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
    border: rem(1) solid transparent;
    cursor: pointer;

    &:hover {
      color: var(--a-text-white);
      background-color: var(--a-blackBg);
      border-color: var(--a-border-dark);
    }
  }

  .navBtnActive {
    background-color: #000;
    color: #fff;
    border-color: #000;
  }

  .navBtnInactive {
    background-color: #fff;
    color: #000;
    border-color: #000;
  }

  .navBtnExit {
    width: 100%;
    max-width: rem(440);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: rem(750);
  }

  .bookingCard {
    margin-top: rem(16);
    background: #fff;
    border-radius: rem(8);
    box-shadow: 0 rem(2) rem(10) rgba(0, 0, 0, 0.08);
    padding: rem(16);
    max-width: rem(520);
  }

  .bookingTitle {
    font-weight: 600;
    color: var(--a-black);
    margin-bottom: rem(8);
  }

  .bookingDates,
  .bookingRooms {
    color: var(--a-text-dark);
    margin-bottom: rem(8);
  }

  .moreBtn {
    align-self: flex-start;
    padding: rem(10) rem(16);
    border-radius: rem(4);
    background: #000;
    color: #fff;
    transition: background-color 0.2s ease;

    &:hover {
      background: #333;
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    width: 100%;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: rem(5);
  }

  .label {
    height: rem(1);
    color: transparent;
  }

  .input {
    padding: rem(10) rem(12);
    font-size: rem(14);
    color: var(--a-text-dark);
    border: rem(1) solid #ddd;
    border-radius: var(--a-borderR--input);

    &:focus {
      outline: none;
      border-color: #007bff;
    }

    :global {
      .p-select {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 rem(12);
        font-size: rem(14);
        color: var(--a-text-dark);
        background-color: var(--a-whiteBg);
        transition: border-color 0.2s ease;
      }

      .p-select.p-focus {
        border-color: #007bff;
      }

      .p-select-label.p-placeholder {
        color: var(--a-text-light);
      }
    }
  }

  .saveBtn {
    width: 100%;
    max-width: rem(320);
    margin: rem(20) 0 0 auto;
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
