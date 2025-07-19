<script setup lang="ts">
import Logo from '~/assets/images/logo.svg'
import BurgerButton from '~/components/ui/BurgerButton.vue'
import SlideMenu from '~/components/ui/SlideMenu.vue'
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const menuLinks = [
  { url: '/', text: 'Главная' },
  { url: '/about', text: 'О нас' },
  { url: '/contacts', text: 'Контакты' }
  // Можно добавить другие ссылки
]
</script>

<template>
  <div>
    <aside :class="$style.aside">
      <BurgerButton
          :isActive="isMenuOpen"
          @toggle="toggleMenu"
      />

      <Logo :class="$style.logo" />

      <div class="info">

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
</style>