<script setup lang="ts">
  import Logo from "~/assets/images/logo.svg";
  import BurgerButton from "~/components/ui/BurgerButton.vue";
  import SlideMenu from "~/components/ui/SlideMenu.vue";
  import { useI18n } from "vue-i18n";

  const { locale, availableLocales, t, setLocale } = useI18n();
  const router = useRouter();
  const isMenuOpen = ref(false);
  const authStore = useAuthStore();

  const authDialogType = ref<"login" | "register" | "recovery" | null>(null);
  const recoveryEmail = ref("");
  const showMyBookingPopup = ref(false);

  // Проверяем наличие успешного бронирования неавторизованного пользователя
  const hasUnauthenticatedBooking = ref(false);

  // Проверка флага в sessionStorage
  const checkUnauthenticatedBooking = () => {
    if (typeof window !== "undefined") {
      hasUnauthenticatedBooking.value =
        sessionStorage.getItem("hasUnauthenticatedBooking") === "true";
    }
  };

  const route = useRoute();

  // Проверяем при монтировании и при изменении статуса аутентификации
  onMounted(() => {
    checkUnauthenticatedBooking();
  });

  // Проверяем флаг при изменении маршрута (например, при переходе на /confirmation)
  watch(
    () => route.path,
    () => {
      checkUnauthenticatedBooking();
    },
  );

  watch(
    () => authStore.isAuthenticated,
    () => {
      checkUnauthenticatedBooking();
      // Если пользователь авторизовался, скрываем попап и очищаем флаг
      if (authStore.isAuthenticated) {
        showMyBookingPopup.value = false;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }
      }
    },
  );

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
    const nextLocale = localeCodes[nextIndex];
    if (typeof nextLocale === "string" && (nextLocale === "ru" || nextLocale === "en")) {
      setLocale(nextLocale as "ru" | "en");
    }
  };

  const goToContacts = () => {
    window.open("http://varvarkan.grandfs.ru/contacts.php", "_blank");
  };

  const showMyBookingDialog = () => {
    showMyBookingPopup.value = true;
  };

  const hideMyBookingDialog = () => {
    showMyBookingPopup.value = false;
  };

  const handleMyBookingLoginSuccess = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hasUnauthenticatedBooking");
    }
    hasUnauthenticatedBooking.value = false;
    hideMyBookingDialog();
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
    <div :class="$style.wrapper">
      <div :class="$style.leftGroup">
        <BurgerButton :is-active="isMenuOpen" @click="toggleMenu" />
      </div>

      <button :class="$style.logoButton" @click="goToHome">
        <Logo :class="$style.logo" />
      </button>

      <div :class="$style.buttonsGroup">
        <Button
          v-if="!authStore.isAuthenticated && hasUnauthenticatedBooking"
          :class="$style.headerButton"
          unstyled
          @click="showMyBookingDialog"
        >
          Моё бронирование
        </Button>
        <Button
          v-if="!authStore.isAuthenticated"
          :class="$style.headerButton"
          unstyled
          @click="showAuthDialog('login')"
        >
          Войти
        </Button>
        <Button
          v-else
          :class="$style.headerButton"
          unstyled
          @click="$router.push('/cabinet')"
        >
          Личный кабинет
        </Button>
      </div>

      <div :class="$style.rightGroup">
        <button :class="$style.langButton" @click="toggleLanguage">
          {{ locale === "ru" ? "ENG" : "RU" }}
        </button>
        <button :class="$style.phoneButton" @click="goToContacts">
          <UIcon name="i-phone" :class="$style.phoneIcon" />
        </button>
      </div>
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

  <BookingMyBookingPopup
    :visible="showMyBookingPopup"
    @close="hideMyBookingDialog"
    @login-success="handleMyBookingLoginSuccess"
  />
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .aside {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--a-whiteBg);
    z-index: z.z("header");
  }

  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    grid-template-rows: auto auto;
    align-items: center;
    width: 100%;
    max-width: #{size.$desktopMax};
    min-height: clamp(60px, 8vw, 95px);
    margin: 0 auto;
    padding: rem(16);
    gap: rem(16);

    @media (max-width: #{size.$desktopMin - 1px}) {
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto auto;
      padding-bottom: rem(12);
    }
  }

  .leftGroup {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: clamp(60px, 8vw, 120px);
    grid-row: 1;
    grid-column: 1;
    justify-self: start;
  }

  .logoButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(60px, 8vw, 120px);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    grid-row: 1;
    grid-column: 2;
    justify-self: center;
  }

  .buttonsGroup {
    display: flex;
    gap: rem(16);
    align-items: center;
    justify-content: center;

    @media (max-width: #{size.$desktopMin - 1px}) {
      grid-row: 2;
      grid-column: 1 / -1;
      width: 100%;
      justify-self: center;
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-row: 1;
      grid-column: 3;
      justify-self: end;
    }
  }

  .rightGroup {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: rem(16);
    grid-row: 1;
    justify-self: end;

    @media (max-width: #{size.$desktopMin - 1px}) {
      grid-column: 3;
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-column: 4;
    }
  }

  .headerButton {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(44);
    padding: rem(12) rem(24);
    font-family: Inter, sans-serif;
    font-size: rem(16);
    font-weight: 400;
    line-height: 1;
    background-color: var(--a-whiteBg);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--btn);
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      background-color: var(--a-mainBg);
    }

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
    background: transparent;
    color: var(--a-text-dark);
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
    color: var(--a-black);
  }

  .show {
    display: none;
    @media (min-width: #{size.$tabletMax}) {
      display: block;
    }
  }
</style>
