<script setup lang="ts">
import Logo from '~/assets/images/logo.svg';
import Phone from '~/assets/images/phone.svg';
import BurgerButton from '~/components/ui/BurgerButton.vue';
import SlideMenu from '~/components/ui/SlideMenu.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { locale, availableLocales, t, setLocale } = useI18n();
const router = useRouter();
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const goToHome = () => {
  router.push('/');
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
  router.push('/contacts');
};


const menuLinks = computed(() => [
  { url: '/', text: t('home') },
  { url: '/about', text: t('about') },
  { url: '/contacts', text: t('contacts') }
]);

const asideRef = ref<HTMLElement | null>(null);
const asideHeight = ref(95);

const updateHeight = () => {
  if (asideRef.value) {
    asideHeight.value = asideRef.value.offsetHeight;
    console.log('Updated asideHeight:', asideHeight.value);
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
        <BurgerButton
            :isActive="isMenuOpen"
            @click="toggleMenu"
        />
      </div>

      <button
          :class="$style.logoButton"
          @click="goToHome"
      >
        <Logo :class="$style.logo" />
      </button>

      <div :class="$style.rightGroup">
        <button
            :class="$style.langButton"
            @click="toggleLanguage"
        >
          {{ locale === 'ru' ? 'ENG' : 'RU' }}
        </button>
        <button
            :class="$style.phoneButton"
            @click="goToContacts"
        >
          <Phone :class="$style.phoneIcon" />
        </button>
      </div>
    </aside>

    <SlideMenu
        :isOpen="isMenuOpen"
        :links="menuLinks"
        :topOffset="asideHeight"
        backgroundColor="--a-mainBg"
        @close="toggleMenu"
    />
</template>

<!-- Стили остаются без изменений -->

<style module lang="scss">
@use "~/assets/styles/variables/z-index" as z;

.aside {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: clamp(60px, 8vw, 120px);
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
  background: transparent;
  border: none;
  cursor: pointer;
  padding: rem(8);
}

.phoneIcon {
  width: rem(24);
  height: rem(24);

  :global(path) {
    fill: var(--a-base);
    transition: fill 0.3s ease;
  }

  &:hover {
    :global(path) {
      fill: var(--a-accent);
    }
  }
}
</style>