<script setup lang="ts">
  import Logo from "~/assets/images/logo.svg";
  import BurgerButton from "~/components/ui/BurgerButton.vue";
  import SlideMenu from "~/components/ui/SlideMenu.vue";
  import { useI18n } from "vue-i18n";

  const { locale, t, setLocale } = useI18n();
  const router = useRouter();
  const isMenuOpen = ref(false);
  const authStore = useAuthStore();

  const authDialogType = ref<"login" | "register" | "recovery" | null>(null);
  const recoveryEmail = ref("");
  const showMyBookingPopup = ref(false);

  // Проверяем наличие успешного бронирования неавторизованного пользователя
  const hasUnauthenticatedBooking = ref(false);

  const checkUnauthenticatedBooking = () => {
    if (typeof window !== "undefined") {
      hasUnauthenticatedBooking.value =
        sessionStorage.getItem("hasUnauthenticatedBooking") === "true";
    }
  };

  const route = useRoute();

  onMounted(() => {
    checkUnauthenticatedBooking();
  });

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

  const LOCALE_OPTIONS: { code: "ru" | "en"; label: string }[] = [
    { code: "ru", label: "RU" },
    { code: "en", label: "ENG" },
  ];
  const isLangOpen = ref(false);
  const langDropdownRef = ref<HTMLElement | null>(null);

  const toggleLangDropdown = () => {
    isLangOpen.value = !isLangOpen.value;
  };

  const selectLocale = (code: "ru" | "en") => {
    setLocale(code);
    isLangOpen.value = false;
  };

  // На русском сайте по умолчанию на кнопке показываем ENG (язык переключения)
  const localeLabel = computed(() =>
    locale.value === "ru" ? "ENG" : "RU",
  );

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

  const CURRENCIES = ["RUB", "USD", "EUR"] as const;
  type CurrencyCode = (typeof CURRENCIES)[number];
  const currentCurrency = ref<CurrencyCode>("RUB");
  const isCurrencyOpen = ref(false);
  const currencyDropdownRef = ref<HTMLElement | null>(null);

  const toggleCurrencyDropdown = () => {
    isCurrencyOpen.value = !isCurrencyOpen.value;
  };

  const selectCurrency = (code: CurrencyCode) => {
    currentCurrency.value = code;
    isCurrencyOpen.value = false;
  };

  const closeDropdownsOnClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      isCurrencyOpen.value &&
      currencyDropdownRef.value &&
      !currencyDropdownRef.value.contains(target)
    ) {
      isCurrencyOpen.value = false;
    }
    if (
      isLangOpen.value &&
      langDropdownRef.value &&
      !langDropdownRef.value.contains(target)
    ) {
      isLangOpen.value = false;
    }
  };

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
    if (typeof document !== "undefined") {
      document.addEventListener("click", closeDropdownsOnClickOutside);
    }

    onUnmounted(() => {
      observer.disconnect();
      if (typeof document !== "undefined") {
        document.removeEventListener("click", closeDropdownsOnClickOutside);
      }
    });
  });
</script>

<template>
  <aside ref="asideRef" :class="$style.aside">
    <button :class="$style.logoButton" aria-label="На главную" @click="goToHome">
      <Logo :class="$style.logo" />
    </button>
    <div :class="$style.wrapper">
      <div :class="$style.leftGroup">
        <BurgerButton :is-active="isMenuOpen" @click="toggleMenu" />
      </div>

      <span :class="$style.logoPlaceholder" aria-hidden="true" />

      <div :class="$style.buttonsGroup">
        <Button
          v-if="!authStore.isAuthenticated && hasUnauthenticatedBooking"
          :class="[$style.headerButton, $style.headerButtonWide]"
          unstyled
          @click="showMyBookingDialog"
        >
          Моё бронирование
        </Button>
        <Button
          v-if="!authStore.isAuthenticated"
          :class="[$style.headerButton, $style.headerButtonNarrow]"
          unstyled
          @click="showAuthDialog('login')"
        >
          Войти
        </Button>
        <Button
          v-else
          :class="[$style.headerButton, $style.headerButtonNarrow]"
          unstyled
          @click="$router.push('/cabinet')"
        >
          Личный кабинет
        </Button>
      </div>

      <div :class="$style.rightGroup">
        <div ref="currencyDropdownRef" :class="$style.currencyWrap">
          <button
            type="button"
            :class="$style.langButton"
            aria-haspopup="listbox"
            :aria-expanded="isCurrencyOpen"
            aria-label="Выбор валюты"
            @click.stop="toggleCurrencyDropdown"
          >
            {{ currentCurrency }}
          </button>
          <Transition name="currency-dropdown">
            <div
              v-show="isCurrencyOpen"
              :class="$style.currencyDropdown"
              role="listbox"
              aria-label="Валюта"
            >
              <button
                v-for="code in CURRENCIES"
                :key="code"
                type="button"
                role="option"
                :aria-selected="currentCurrency === code"
                :class="[$style.currencyOption, currentCurrency === code && $style.currencyOptionActive]"
                @click.stop="selectCurrency(code)"
              >
                {{ code }}
              </button>
            </div>
          </Transition>
        </div>
        <div ref="langDropdownRef" :class="$style.currencyWrap">
          <button
            type="button"
            :class="$style.langButton"
            aria-haspopup="listbox"
            :aria-expanded="isLangOpen"
            aria-label="Выбор языка"
            @click.stop="toggleLangDropdown"
          >
            {{ localeLabel }}
          </button>
          <Transition name="currency-dropdown">
            <div
              v-show="isLangOpen"
              :class="$style.currencyDropdown"
              role="listbox"
              aria-label="Язык"
            >
              <button
                v-for="opt in LOCALE_OPTIONS"
                :key="opt.code"
                type="button"
                role="option"
                :aria-selected="locale === opt.code"
                :class="[$style.currencyOption, locale === opt.code && $style.currencyOptionActive]"
                @click.stop="selectLocale(opt.code)"
              >
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>
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
    align-content: center;
    width: 100%;
    max-width: #{size.$desktopMax};
    min-height: clamp(60px, 8vw, 93px);
    margin: 0 auto;
    padding: rem(16);
    column-gap: rem(16);
    row-gap: 0;

    @media (min-width: #{size.$desktopMin}) {
      min-height: 93px;
      column-gap: rem(40);
    }

    @media (max-width: #{size.$desktopMin - 1px}) {
      grid-template-columns: auto 1fr auto;
      grid-template-rows: rem(70) auto;
      min-height: rem(150);
      padding: rem(16) rem(16) rem(12);
      column-gap: rem(16);
      row-gap: rem(12);
      align-content: start;
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

  .logoPlaceholder {
    grid-row: 1;
    grid-column: 2;
    min-width: clamp(60px, 8vw, 120px);
  }

  .logoButton {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(60px, 8vw, 120px);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    @media (max-width: #{size.$desktopMin - 1px}) {
      top: rem(51);
      transform: translate(-50%, -50%);
    }
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
      gap: rem(15);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-column: 4;
      gap: rem(40);
    }
  }

  .currencyWrap {
    position: relative;
  }

  .currencyDropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: rem(4);
    width: rem(60);
    min-height: rem(60);
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--btn);
    box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.08);
    overflow: hidden;
    z-index: 1;
  }

  .currencyOption {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: rem(30);
    padding: 0;
    background: transparent;
    border: none;
    color: var(--secondary);
    font-size: rem(14);
    font-family: Inter, sans-serif;
    font-weight: 400;
    line-height: 1;
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;
    box-sizing: border-box;

    &:hover {
      color: var(--a-base);
      background-color: var(--ui-color-primary-50);
    }
  }

  .currencyOptionActive {
    color: var(--a-text-dark);
    font-weight: 500;
  }

  .headerButton {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(44);
    height: rem(44);
    padding: rem(12) rem(24);
    font-family: Inter, sans-serif;
    font-size: rem(18);
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

  .headerButtonWide {
    min-width: rem(204);
  }

  .headerButtonNarrow {
    min-width: rem(150);
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
    min-width: rem(37);
    height: rem(29);
    padding: rem(6) rem(12);
    background: transparent;
    border: none;
    color: var(--secondary);
    font-size: rem(18);
    font-family: "Futura PT", sans-serif;
    font-weight: 400;
    text-transform: uppercase;
    line-height: 1;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: var(--a-base);
    }

    @media (max-width: #{size.$desktopMin - 1px}) {
      font-size: rem(16);
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
    color: var(--secondary);
  }

  .show {
    display: none;
    @media (min-width: #{size.$tabletMax}) {
      display: block;
    }
  }
</style>

<style lang="scss">
  .currency-dropdown-enter-active,
  .currency-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .currency-dropdown-enter-from,
  .currency-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
