<script setup lang="ts">
  interface Props {
    activeSection: string;
  }

  interface Emits {
    (e: "section-change", section: string): void;
    (e: "new-booking" | "logout"): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();
</script>

<template>
  <nav :class="$style.navBlock" aria-label="Навигация личного кабинета">
    <Button
      unstyled
      label="Личные данные"
      :class="[
        $style.navBtn,
        activeSection === 'personal' ? $style.navBtnActive : $style.navBtnInactive,
      ]"
      :aria-current="activeSection === 'personal' ? 'page' : undefined"
      @click="emit('section-change', 'personal')"
    />

    <Button
      unstyled
      label="Мои бронирования"
      :class="[
        $style.navBtn,
        activeSection === 'bookings' ? $style.navBtnActive : $style.navBtnInactive,
      ]"
      :aria-current="activeSection === 'bookings' ? 'page' : undefined"
      @click="emit('section-change', 'bookings')"
    />

    <Button
      unstyled
      label="Новое бронирование"
      :class="[$style.navBtn, $style.navBtnInactive]"
      @click="emit('new-booking')"
    />

    <Button
      unstyled
      label="Выйти"
      class="btn__bs"
      :class="$style.navBtnExit"
      aria-label="Выйти из личного кабинета"
      @click="emit('logout')"
    />
  </nav>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .navBlock {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(24);
    width: 100%;
    max-width: rem(440);

    @media (min-width: #{size.$desktopMax}) {
      max-width: rem(700);
    }
  }

  .navBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: rem(44);
    padding: rem(10) rem(16);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    line-height: 1;
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
    background-color: var(--a-blackBg);
    color: var(--a-text-white);
    border-color: var(--a-border-dark);
  }

  .navBtnInactive {
    background-color: var(--a-whiteBg);
    color: var(--a-text-dark);
    border-color: var(--a-border-dark);
  }

  .navBtnExit {
    width: 100%;
    background-color: var(--a-primaryBg);

    &:hover {
      background-color: var(--a-blackBg);
    }
  }
</style>

