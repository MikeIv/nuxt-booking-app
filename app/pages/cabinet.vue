<script setup lang="ts">
  import { useAuthStore } from "~/stores/auth";
  import { useBookingStore } from "~/stores/booking";
  import { countriesRu } from "~/utils/countries";
  import { useNotificationToast } from "~/composables/useToast";
  import BookingSelect from "~/components/booking/BookingSelect.vue";
  import type { BookingHistoryItem, BookingHistoryResponse } from "~/types/booking";
  import type { UserProfile, ProfileResponse, UpdateProfileResponse } from "~/types/auth";

  const router = useRouter();
  const authStore = useAuthStore();
  const bookingStore = useBookingStore();
  const toast = useNotificationToast();

  const activeSection = ref("personal");
  const hasChanges = ref(false);

  // Вспомогательная функция для обработки ошибок
  const handleError = (err: unknown, defaultMessage: string, summary = "Ошибка") => {
    if (import.meta.dev) {
      console.error("💥 Ошибка:", err);
    }
    const message = (err as { message?: string })?.message || defaultMessage;
    toast.add({
      severity: "error",
      summary,
      detail: message,
      life: 5000,
    });
  };

  const originalData = reactive<UserProfile>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  const formData = reactive<UserProfile>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  const isLoadingProfile = ref(false);
  const isSaving = ref(false);
  
  // Состояния для истории бронирований
  const bookingHistory = ref<BookingHistoryItem[]>([]);
  const isLoadingBookings = ref(false);
  const bookingsLoaded = ref(false);
  const isActualBookings = ref(true); // true - будущие, false - прошедшие
  const currentPage = ref(1);
  const perPage = ref(10);
  const totalPages = ref(1);

  watch(
    () => authStore.user,
    (user) => {
      if (!user) return;
      
      // Если есть id, пытаемся загрузить сохраненный профиль
      const saved = user.id ? bookingStore.getUserProfile(user.id) : null;
      
      const source = saved || {
        name: user.name || "",
        surname: user.surname || "",
        middle_name: (user as { middle_name?: string }).middle_name || "",
        phone: user.phone || "",
        email: user.email || "",
        country: user.country || "",
      };
      Object.assign(originalData, source);
      Object.assign(formData, originalData);
      hasChanges.value = false;
    },
    { immediate: true },
  );

  const checkChanges = () => {
    const keys = Object.keys(originalData) as Array<keyof typeof originalData>;
    hasChanges.value = keys.some((key) => formData[key] !== originalData[key]);
  };

  const saveChanges = async () => {
    if (!authStore.user) return;

    isSaving.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Отправка обновленных данных профиля...");
      }

      const { put } = useApi();
      const response = (await put("/v1/users/profile", {
        name: formData.name,
        surname: formData.surname,
        middle_name: formData.middle_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
      })) as UpdateProfileResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (обновление профиля):", response);
      }

      if (response.success) {
        // Обновляем локальные данные только после успешного ответа
        const updatedUser = { ...authStore.user, ...formData };
        authStore.setUser(updatedUser);

        if (authStore.user?.id) {
          bookingStore.saveUserProfile(authStore.user.id, {
            name: formData.name,
            surname: formData.surname,
            middle_name: formData.middle_name,
            phone: formData.phone,
            email: formData.email,
            country: formData.country,
          });
        }

        Object.assign(originalData, formData);
        hasChanges.value = false;

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: response.message || "Данные профиля успешно обновлены",
          life: 3000,
        });

        if (import.meta.dev) {
          console.log("✅ Данные профиля обновлены:", updatedUser);
        }
      } else {
        if (import.meta.dev) {
          console.warn("⚠️ Не удалось обновить профиль:", response.message);
        }
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail: response.message || "Не удалось обновить данные профиля",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось обновить данные профиля");
    } finally {
      isSaving.value = false;
    }
  };

  const fetchUserProfile = async () => {
    if (!authStore.user) return;

    isLoadingProfile.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Загрузка профиля пользователя...");
      }

      const { get } = useApi();
      const response = (await get("/v1/users/profile")) as ProfileResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (профиль):", response);
      }

      if (response.success && response.payload) {
        // Обновляем пользователя в authStore с данными из API (включая id)
        const updatedUser = {
          ...authStore.user,
          id: response.payload.id,
          name: response.payload.name || authStore.user?.name || "",
          surname: response.payload.surname || authStore.user?.surname || "",
          middle_name: response.payload.middle_name || (authStore.user as { middle_name?: string })?.middle_name || "",
          email: response.payload.email || authStore.user?.email || "",
          phone: response.payload.phone || authStore.user?.phone || "",
          country: response.payload.country || authStore.user?.country || "",
        };
        authStore.setUser(updatedUser);
        
        // Проверяем, есть ли уже сохраненный профиль в bookingStore
        const savedProfile = bookingStore.getUserProfile(response.payload.id);
        
        // Если есть сохраненный профиль, используем его вместо данных с API
        const profileData = savedProfile || {
          name: response.payload.name || "",
          surname: response.payload.surname || "",
          middle_name: response.payload.middle_name || "",
          phone: response.payload.phone || "",
          email: response.payload.email || "",
          country: response.payload.country || "",
        };

        Object.assign(originalData, profileData);
        Object.assign(formData, profileData);
        hasChanges.value = false;

        // Сохраняем профиль в store только если его там еще нет
        if (!savedProfile) {
          bookingStore.saveUserProfile(response.payload.id, profileData);
        }

        if (import.meta.dev) {
          console.log("✅ Профиль загружен:", profileData);
          console.log("✅ Пользователь обновлен в authStore с id:", response.payload.id);
        }
      } else {
        if (import.meta.dev) {
          console.warn("⚠️ Не удалось загрузить профиль:", response.message);
        }
        toast.add({
          severity: "warn",
          summary: "Внимание",
          detail: response.message || "Не удалось загрузить данные профиля",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось загрузить данные профиля");
    } finally {
      isLoadingProfile.value = false;
    }
  };

  const fetchBookingHistory = async (resetPage = false) => {
    if (!authStore.user) {
      if (import.meta.dev) {
        console.warn("⚠️ Пользователь не авторизован");
      }
      return;
    }

    if (resetPage) {
      currentPage.value = 1;
    }

    isLoadingBookings.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Загрузка истории бронирований...", {
          is_actual: isActualBookings.value,
          page: currentPage.value,
          per_page: perPage.value,
        });
      }

      const { get } = useApi();
      const response = await get<BookingHistoryItem[]>("/v1/users/bookings/history", {
        is_actual: isActualBookings.value, // snake_case вместо camelCase
        page: currentPage.value,
        per_page: perPage.value,
      }) as BookingHistoryResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (история бронирований):", response);
      }

      if (response.success) {
        bookingHistory.value = response.payload || [];
        bookingsLoaded.value = true;

        // Если есть информация о пагинации в ответе (например, в headers или meta)
        // totalPages.value = response.meta?.total_pages || 1;

        if (import.meta.dev) {
          console.log(`✅ Загружено бронирований: ${bookingHistory.value.length}`);
        }
      } else {
        if (import.meta.dev) {
          console.warn("⚠️ Не удалось загрузить историю бронирований:", response.message);
        }
        toast.add({
          severity: "warn",
          summary: "Внимание",
          detail: response.message || "Не удалось загрузить историю бронирований",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось загрузить историю бронирований");
    } finally {
      isLoadingBookings.value = false;
    }
  };

  const toggleBookingsType = async (isActual: boolean) => {
    isActualBookings.value = isActual;
    await fetchBookingHistory(true);
  };

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value && !isLoadingBookings.value) {
      currentPage.value = page;
      await fetchBookingHistory();
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleNewBooking = async () => {
    await router.push("/");
  };

  const handleSectionChange = async (section: string) => {
    activeSection.value = section;
    if (section === "bookings" && !bookingsLoaded.value) {
      await fetchBookingHistory(true);
    }
  };

  const handleLogout = async () => {
    if (import.meta.dev) {
      console.log("🔄 Начало выхода...");
    }

    authStore.setLoading(true);
    authStore.setError(null);

    try {
      if (import.meta.dev) {
        console.log("📡 Отправка запроса на выход...");
      }

      const { post } = useApi();
      const response = await post("/v1/auth/logout");

      if (import.meta.dev) {
        console.log("📨 Ответ сервера:", response);
      }

      if (response.success) {
        if (import.meta.dev) {
          console.log("✅ Успешный выход");
        }
        authStore.logout();
        await router.push("/");
      } else {
        if (import.meta.dev) {
          console.log("❌ Ошибка в ответе:", response.message);
        }
        authStore.logout();
        toast.add({
          severity: "error",
          summary: "Ошибка выхода",
          detail:
            response.message || "Не удалось выполнить выход. Попробуйте позже.",
          life: 5000,
        });
        await router.push("/");
      }
    } catch (err: unknown) {
      authStore.logout();
      handleError(err, "Не удалось выполнить выход. Попробуйте позже.", "Ошибка выхода");
      await router.push("/");
    } finally {
      authStore.setLoading(false);
    }
  };

  onMounted(async () => {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;

    if (authStore.user) {
      await fetchUserProfile();
    }
  });
</script>

<template>
  <main :class="$style.cabinet">
    <h1 :class="$style.header">Личный кабинет</h1>
    <div :class="$style.container">
      <nav :class="$style.navBlock" aria-label="Навигация личного кабинета">
        <Button
          unstyled
          label="Личные данные"
          :class="[
            $style.navBtn,
            activeSection === 'personal'
              ? $style.navBtnActive
              : $style.navBtnInactive,
          ]"
          :aria-current="activeSection === 'personal' ? 'page' : undefined"
          @click="handleSectionChange('personal')"
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
          :aria-current="activeSection === 'bookings' ? 'page' : undefined"
          @click="handleSectionChange('bookings')"
        />
        <Button
          unstyled
          label="Новое бронирование"
          :class="[$style.navBtn, $style.navBtnInactive]"
          @click="handleNewBooking"
        />
        <Button
          unstyled
          label="Выйти"
          class="btn__bs"
          :class="$style.navBtnExit"
          aria-label="Выйти из личного кабинета"
          @click="handleLogout"
        />
      </nav>

      <!-- Личные данные -->
      <section v-if="activeSection === 'personal'" :class="$style.content" aria-labelledby="personal-heading">
        <h2 id="personal-heading" class="visually-hidden">Личные данные</h2>
        <div v-if="isLoadingProfile" :class="$style.loadingIndicator">
          Загрузка данных профиля...
        </div>
        <form v-else :class="$style.form" @submit.prevent="saveChanges">
          <div :class="$style.field">
            <label for="name" :class="$style.label">Имя</label>
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
            <label for="surname" :class="$style.label">Фамилия</label>
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
            <label for="middle_name" :class="$style.label">Отчество</label>
            <input
              id="middle_name"
              v-model="formData.middle_name"
              :class="$style.input"
              type="text"
              placeholder="Введите отчество"
              @input="checkChanges"
            >
          </div>

          <div :class="$style.field">
            <label for="phone" :class="$style.label">Телефон</label>
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
            <label for="email" :class="$style.label">E-mail</label>
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
            <label for="country" :class="$style.label">Гражданство</label>
            <BookingSelect
              v-model="formData.country"
              :options="countriesRu"
              placeholder="Выберите страну"
              :searchable="true"
              search-placeholder="Поиск страны..."
              @update:model-value="checkChanges"
            />
          </div>

          <Button
            :label="isSaving ? 'Сохранение...' : 'Изменить'"
            type="submit"
            unstyled
            class="btn__bs dark"
            :class="[$style.saveBtn, hasChanges && !isSaving ? $style.active : '']"
            :disabled="!hasChanges || isSaving"
          />
        </form>
      </section>

      <!-- Мои бронирования -->
      <section v-if="activeSection === 'bookings'" :class="$style.content" aria-labelledby="bookings-heading">
        <h2 id="bookings-heading">Мои бронирования</h2>
        
        <!-- Фильтры -->
        <div :class="$style.bookingsFilters" role="group" aria-label="Фильтр типа бронирований">
          <Button
            unstyled
            label="Актуальные"
            :class="[
              $style.filterBtn,
              isActualBookings ? $style.filterBtnActive : $style.filterBtnInactive,
            ]"
            :aria-pressed="isActualBookings"
            :disabled="isLoadingBookings"
            @click="toggleBookingsType(true)"
          />
          <Button
            unstyled
            label="Прошедшие"
            :class="[
              $style.filterBtn,
              !isActualBookings ? $style.filterBtnActive : $style.filterBtnInactive,
            ]"
            :aria-pressed="!isActualBookings"
            :disabled="isLoadingBookings"
            @click="toggleBookingsType(false)"
          />
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="isLoadingBookings" :class="$style.loadingIndicator">
          Загрузка истории бронирований...
        </div>

        <!-- Нет бронирований -->
        <div v-else-if="bookingsLoaded && bookingHistory.length === 0" :class="$style.emptyState">
          <p>{{ isActualBookings ? 'У вас нет актуальных бронирований' : 'У вас нет прошедших бронирований' }}</p>
          <Button 
            unstyled 
            label="Забронировать номер" 
            class="btn__bs dark"
            :class="$style.bookNowBtn"
            @click="handleNewBooking"
          />
        </div>

        <!-- Список бронирований -->
        <div v-else-if="bookingsLoaded && bookingHistory.length > 0" :class="$style.bookingsList">
          <article 
            v-for="(booking, index) in bookingHistory" 
            :key="booking.id || booking.uuid || index"
            :class="$style.bookingCard"
          >
            <header :class="$style.bookingTitle">
              {{ booking.booking_number ? `Бронирование № ${booking.booking_number}` : `Бронирование #${booking.id || booking.uuid}` }}
            </header>
            
            <div v-if="booking.start_at || booking.end_at" :class="$style.bookingDates">
              <time :datetime="booking.start_at">{{ formatDate(booking.start_at) }}</time>
              -
              <time :datetime="booking.end_at">{{ formatDate(booking.end_at) }}</time>
            </div>
            
            <div v-if="booking.rooms_count" :class="$style.bookingRooms">
              Количество номеров: {{ booking.rooms_count }}
            </div>
            
            <div v-if="booking.status" :class="$style.bookingStatus">
              Статус: {{ booking.status }}
            </div>
            
            <!-- Отображение дополнительных полей, если они есть -->
            <div v-if="Object.keys(booking).length > 0" :class="$style.bookingDetails">
              <details :class="$style.bookingDetailsToggle">
                <summary>Подробная информация</summary>
                <pre :class="$style.bookingJson">{{ JSON.stringify(booking, null, 2) }}</pre>
              </details>
            </div>
          </article>

          <!-- Пагинация -->
          <nav v-if="totalPages > 1" :class="$style.pagination" aria-label="Пагинация бронирований">
            <Button
              unstyled
              label="Назад"
              :class="$style.paginationBtn"
              :disabled="currentPage === 1 || isLoadingBookings"
              :aria-label="`Перейти на страницу ${currentPage - 1}`"
              @click="goToPage(currentPage - 1)"
            />
            <span :class="$style.paginationInfo" aria-current="page">
              Страница {{ currentPage }} из {{ totalPages }}
            </span>
            <Button
              unstyled
              label="Вперед"
              :class="$style.paginationBtn"
              :disabled="currentPage === totalPages || isLoadingBookings"
              :aria-label="`Перейти на страницу ${currentPage + 1}`"
              @click="goToPage(currentPage + 1)"
            />
          </nav>
        </div>
      </section>
    </div>
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  :global(.visually-hidden) {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

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

  .loadingIndicator {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: rem(40);
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .bookingsFilters {
    display: flex;
    gap: rem(12);
    width: 100%;
    margin-bottom: rem(24);
    justify-content: center;
  }

  .filterBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(140);
    padding: rem(10) rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(15);
    line-height: 1.2;
    border-radius: var(--a-borderR--btn);
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
    border: rem(1) solid transparent;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .filterBtnActive {
    background-color: var(--a-blackBg);
    color: var(--a-text-white);
    border-color: var(--a-border-dark);
  }

  .filterBtnInactive {
    background-color: var(--a-whiteBg);
    color: var(--a-text-dark);
    border-color: var(--a-border-light);

    &:hover:not(:disabled) {
      border-color: var(--a-border-dark);
    }
  }

  .emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: rem(60) rem(20);
    text-align: center;
    
    p {
      font-size: rem(18);
      color: var(--a-text-dark);
      margin-bottom: rem(20);
    }
  }

  .bookNowBtn {
    max-width: rem(240);
  }

  .bookingsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    width: 100%;
  }

  .bookingCard {
    background: #fff;
    border-radius: rem(8);
    box-shadow: 0 rem(2) rem(10) rgba(0, 0, 0, 0.08);
    padding: rem(20);
    width: 100%;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 rem(4) rem(16) rgba(0, 0, 0, 0.12);
    }
  }

  .bookingTitle {
    font-weight: 600;
    font-size: rem(18);
    color: var(--a-black);
    margin-bottom: rem(12);
  }

  .bookingDates,
  .bookingRooms,
  .bookingStatus {
    color: var(--a-text-dark);
    font-size: rem(15);
    margin-bottom: rem(8);
    line-height: 1.4;
  }

  .bookingStatus {
    font-weight: 500;
  }

  .bookingDetails {
    margin-top: rem(16);
    padding-top: rem(16);
    border-top: rem(1) solid var(--a-border-light);
  }

  .bookingDetailsToggle {
    cursor: pointer;
    
    summary {
      font-size: rem(14);
      color: var(--a-text-dark);
      font-weight: 500;
      padding: rem(8);
      border-radius: rem(4);
      transition: background-color 0.2s ease;
      user-select: none;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &::marker {
        color: var(--a-text-dark);
      }
    }
  }

  .bookingJson {
    margin-top: rem(12);
    padding: rem(12);
    background-color: #f5f5f5;
    border-radius: rem(4);
    font-size: rem(12);
    font-family: "Courier New", monospace;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    color: #333;
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

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: rem(20);
    width: 100%;
    margin-top: rem(24);
    padding-top: rem(24);
    border-top: rem(1) solid var(--a-border-light);
  }

  .paginationBtn {
    padding: rem(10) rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(15);
    color: var(--a-text-dark);
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--btn);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
      color: var(--a-text-white);
      border-color: var(--a-border-dark);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .paginationInfo {
    font-size: rem(15);
    color: var(--a-text-dark);
    font-weight: 500;
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
    @extend :global(.visually-hidden);
  }

  .input {
    width: 100%;
    height: rem(58);
    padding: 0 rem(16);
    font-size: rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background-color: var(--a-whiteBg);
    font-family: "Inter", sans-serif;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(191, 157, 124, 0.1);
    }

    &::placeholder {
      color: var(--a-text-light);
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
