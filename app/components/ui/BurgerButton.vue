<script setup lang="ts">
defineProps({
  isActive: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle'])

const handleClick = () => {
  emit('toggle')
}
</script>

<template>
  <button
      :class="[$style.burger, { [$style.burgerActive]: isActive }]"
      @click="handleClick"
      aria-label="Toggle menu"
      aria-expanded="isActive"
  >
    <span :class="$style.burgerLine"></span>
    <span :class="$style.burgerLine"></span>
    <span :class="$style.burgerLine"></span>
  </button>
</template>

<style module lang="scss">
.burger {
  position: relative;
  width: rem(24);
  height: rem(24);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1001;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(0.9);
  }
}

.burgerLine {
  display: block;
  width: 100%;
  height: rem(2);
  background-color: var(--a-base);
  transition: all 0.3s ease;
}

.burgerActive .burgerLine:nth-child(1) {
  transform: translateY(rem(11)) rotate(45deg);
}

.burgerActive .burgerLine:nth-child(2) {
  opacity: 0;
}

.burgerActive .burgerLine:nth-child(3) {
  transform: translateY(rem(-11)) rotate(-45deg);
}
</style>