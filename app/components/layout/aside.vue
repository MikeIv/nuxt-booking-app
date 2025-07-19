<script setup lang="ts">
import Logo from '~/assets/images/logo.svg'
import Phone from '~/assets/images/phone.svg'
import BurgerButton from '~/components/ui/BurgerButton.vue'
import SlideMenu from '~/components/ui/SlideMenu.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale, availableLocales, t } = useI18n()
const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const goToHome = () => {
  router.push('/')
}

const toggleLanguage = () => {
  if (availableLocales.length < 2) return
  const newLocale = locale.value === 'ru' ? 'en' : 'ru'
  locale.value = newLocale
}

const goToContacts = () => {
  router.push('/contacts')
}

const menuLinks = [
  { url: '/', textKey: 'home' },
  { url: '/about', textKey: 'about' },
  { url: '/contacts', textKey: 'contacts' }
]
</script>

<template>
  <div>
    <aside :class="$style.aside">
      <BurgerButton
          :isActive="isMenuOpen"
          @toggle="toggleMenu"
      />

      <button
          :class="$style.logoButton"
          @click="goToHome"
      >
        <Logo :class="$style.logo" />
      </button>

      <div :class="$style.info">
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
        topOffset="80"
        backgroundColor="--a-mainBg"
        @close="toggleMenu"
    />
  </div>
</template>

<style module lang="scss">
/* Стили остаются без изменений */
.aside {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: rem(70);
  padding: rem(16);
  background-color: var(--a-whiteBg);
  z-index: 1000;
}

.logoButton {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.logo {
  width: 120px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  :global(path) {
    fill: var(--a-base);
    transition: fill 0.3s ease;
  }
}

.info {
  display: flex;
  align-items: center;
  gap: rem(16);
}

.langButton {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: rem(54);
  padding: rem(8) rem(12);
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