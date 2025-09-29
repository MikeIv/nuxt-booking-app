<script setup lang="ts">
  import Logo from "~/assets/images/logo.svg";
  import BurgerButton from "~/components/ui/BurgerButton.vue";
  import SlideMenu from "~/components/ui/SlideMenu.vue";
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";

  const { locale, availableLocales, t, setLocale } = useI18n();
  const router = useRouter();
  const isMenuOpen = ref(false);
  const authStore = useAuthStore();

  const authDialogType = ref<"login" | "register" | "recovery" | null>(null);
  const recoveryEmail = ref("");

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const goToHome = () => {
    router.push("/");
  };

  const toggleLanguage = () => {
    const localeCodes = Array.isArray(availableLocales)
      ? availableLocales
      : Object.values(availableLocales);

    if (localeCodes.length < 2) return;

    const currentIndex = localeCodes.indexOf(locale.value);
    const nextIndex = (currentIndex + 1) % localeCodes.length;
    setLocale(localeCodes[nextIndex]);
  };

  const goToContacts = () => {
    window.open("http://varvarkan.grandfs.ru/contacts.php", "_blank");
  };

  const showAuthDialog = (
    type: "login" | "register" | "recovery",
    email?: string,
  ) => {
    authDialogType.value = type;
    if (email) {
      recoveryEmail.value = email;
    }
  };

  const hideAuthDialog = () => {
    authDialogType.value = null;
    recoveryEmail.value = "";
  };

  const switchAuthDialog = (
    to: "login" | "register" | "recovery",
    email?: string,
  ) => {
    authDialogType.value = to;
    if (email) {
      recoveryEmail.value = email;
    }
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

  const menuLinks = computed(() => [
    { url: "/", text: t("home") },
    { url: "http://varvarkan.grandfs.ru/about.php", text: t("about") },
    { url: "http://varvarkan.grandfs.ru/hotel.php", text: t("hotel") },
    { url: "http://varvarkan.grandfs.ru/service.php", text: t("services") },
    { url: "http://varvarkan.grandfs.ru/gallery.php", text: t("gallery") },
    {
      url: "http://varvarkan.grandfs.ru/construction-progress.php",
      text: t("construction"),
    },
    { url: "http://varvarkan.grandfs.ru/contacts.php", text: t("contacts") },
  ]);

  const asideRef = ref<HTMLElement | null>(null);
  const asideHeight = ref(95);

  const updateHeight = () => {
    if (asideRef.value) {
      asideHeight.value = asideRef.value.offsetHeight;
      console.log("Updated asideHeight:", asideHeight.value);
    }
  };

  onMounted(() => {
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (asideRef.value) observer.observe(asideRef.value);

    onUnmounted(() => observer.disconnect());
  });
</script>

<template>
  <aside ref="asideRef" :class="$style.aside">
    <div :class="$style.leftGroup">
      <BurgerButton :is-active="isMenuOpen" @click="toggleMenu" />
    </div>

    <button :class="$style.logoButton" @click="goToHome">
      <Logo :class="$style.logo" />
    </button>

    <div :class="$style.rightGroup">
      <!--      <UButton-->
      <!--        color="bgAccent"-->
      <!--        class="text-white px-4 py-2"-->
      <!--        size="sm"-->
      <!--        :class="$style.show"-->
      <!--      >-->
      <!--        Забронировать-->
      <!--      </UButton>-->

      <Button
        v-if="!authStore.isAuthenticated"
        label="Войти"
        class="btn__bs dark"
        unstyled
        @click="showAuthDialog('login')"
      />
      <Button
        v-else
        :label="authStore.loading ? 'Выход...' : 'Выйти'"
        class="btn__bs dark"
        unstyled
        :loading="authStore.loading"
        :disabled="authStore.loading"
        @click="handleLogout"
      />

      <button :class="$style.langButton" @click="toggleLanguage">
        {{ locale === "ru" ? "ENG" : "RU" }}
      </button>
      <button :class="$style.phoneButton" @click="goToContacts">
        <UIcon name="i-phone" :class="$style.phoneIcon" />
      </button>
    </div>
  </aside>

  <SlideMenu
    :is-open="isMenuOpen"
    :links="menuLinks"
    :top-offset="asideHeight"
    background-color="--a-mainBg"
    @close="toggleMenu"
  />

  <BookingLoginPopup
    :visible="authDialogType === 'login'"
    @close="hideAuthDialog"
    @switch-to-register="switchAuthDialog('register')"
    @switch-to-recovery="switchAuthDialog('recovery', $event)"
    @login-success="hideAuthDialog"
  />

  <BookingRegisterPopup
    :visible="authDialogType === 'register'"
    @close="hideAuthDialog"
    @switch-to-login="switchAuthDialog('login')"
  />

  <BookingPasswordRecoveryPopup
    :visible="authDialogType === 'recovery'"
    :initial-email="recoveryEmail"
    @close="hideAuthDialog"
    @switch-to-login="switchAuthDialog('login')"
  />
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .aside {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: #{size.$desktopMax};
    height: clamp(60px, 8vw, 95px);
    padding: rem(16);
    background-color: var(--a-whiteBg);
    z-index: z.z("header");
  }

  .leftGroup {
    width: clamp(60px, 8vw, 120px);
    display: flex;
    justify-content: flex-start;
  }

  .logoButton {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: clamp(60px, 8vw, 120px);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .rightGroup {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: rem(16);
  }

  .logo {
    width: 100%;
    height: auto;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    :global(path) {
      fill: var(--a-base);
      transition: fill 0.3s ease;
    }
  }

  .langButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(40px, 4vw, 50px);
    max-height: rem(30);
    padding: rem(6) rem(12);
    border: 1px solid var(--a-accentBg);
    border-radius: rem(4);
    background: transparent;
    color: var(--a-base);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background: var(--a-accentBg);
      color: var(--a-white);
    }
  }

  .phoneButton {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(24);
    height: rem(24);
    padding: rem(8);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .phoneIcon {
    position: absolute;
    width: rem(24);
    height: rem(24);
    color: var(--primary);
  }

  .show {
    display: none;
    @media (min-width: #{size.$tabletMax}) {
      display: block;
    }
  }
</style>
