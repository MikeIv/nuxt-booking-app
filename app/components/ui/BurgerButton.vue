<script setup lang="ts">
  defineProps({
    isActive: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(["toggle"]);

  const handleClick = () => {
    emit("toggle");
  };
</script>

<template>
  <button
    :class="[$style.burger, { [$style.burgerActive]: isActive }]"
    aria-label="Toggle menu"
    aria-expanded="isActive"
    @click="handleClick"
  >
    <span :class="$style.burgerLine" />
    <span :class="$style.burgerLine" />
    <span :class="$style.burgerLine" />
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .burger {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: rem(8);
    width: rem(36);
    height: rem(36);
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;

    z-index: 1001;
    transition: transform 0.3s ease;

    @media (max-width: #{size.$desktopMin - 1px}) {
      width: rem(28);
      height: rem(28);
      gap: rem(6);
    }

    &:active {
      transform: scale(0.9);
    }
  }

  .burgerLine {
    display: block;
    width: 100%;
    height: rem(2);
    background-color: var(--secondary);
    border-radius: rem(1);
    transition: all 0.3s ease;
  }

  /* Средняя линия короче в макете (M1 18.46H22.56) */
  .burgerLine:nth-child(2) {
    max-width: 62.5%;
  }

  .burgerActive .burgerLine:nth-child(1) {
    transform: translateY(rem(9.7)) rotate(45deg);
  }

  .burgerActive .burgerLine:nth-child(2) {
    opacity: 0;
  }

  .burgerActive .burgerLine:nth-child(3) {
    transform: translateY(rem(-9.7)) rotate(-45deg);
  }

  @media (max-width: #{size.$desktopMin - 1px}) {
    .burgerActive .burgerLine:nth-child(1) {
      transform: translateY(rem(7.5)) rotate(45deg);
    }

    .burgerActive .burgerLine:nth-child(3) {
      transform: translateY(rem(-7.5)) rotate(-45deg);
    }
  }
</style>
