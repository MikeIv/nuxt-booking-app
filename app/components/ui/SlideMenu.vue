<script setup lang="ts">
import { gsap } from 'gsap'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  links: {
    type: Array as () => Array<{ url: string, text: string }>,
    default: () => [],
  },
  topOffset: {
    type: Number,
    default: 95,
  },
  backgroundColor: {
    type: String,
    default: '--a-mainBg',
  },
})

const menuStyles = computed(() => ({
  '--top-offset': `${props.topOffset}px`,
  '--bg-color': `var(${props.backgroundColor})`,
}))

const emit = defineEmits(['close'])

const enterAnimation = (el: HTMLElement, done: () => void) => {
  gsap.fromTo(el,
    { y: '-100%', opacity: 0 },
    {
      y: '0%',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: done,
    },
  )
}

const leaveAnimation = (el: HTMLElement, done: () => void) => {
  gsap.fromTo(el,
    { y: '0%', opacity: 1 },
    {
      y: '-100%',
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: done,
    },
  )
}

const safeTranslate = (key: string) => {
  return te(key) ? t(key) : key
}

const handleLinkClick = () => {
  emit('close')
}
</script>

<template>
  <Transition
    name="slide"
    :css="false"
    @enter="enterAnimation"
    @leave="leaveAnimation"
  >
    <div
      v-if="isOpen"
      :class="$style.menuOverlay"
      :style="menuStyles"
    >
      <div :class="$style.menuContent">
        <a
          v-for="link in links"
          :key="link.url"
          :href="link.url"
          :class="$style.menuLink"
          @click="handleLinkClick"
        >
          {{ safeTranslate(link.text) }}
        </a>
      </div>
    </div>
  </Transition>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/z-index" as z;

.menuOverlay {
  position: fixed;
  top: var(--top-offset);
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-color);
  z-index: z.z("modal", "nav-menu");
  overflow-y: hidden;
  transform: translateY(-100%);
  will-change: transform;
}

.menuContent {
  padding: rem(32);
  display: flex;
  flex-direction: column;
  gap: rem(24);
  min-height: calc(100vh - #{rem(70)});
}

.menuLink {
  font-size: rem(24);
  color: var(--a-base);
  text-decoration: none;
  transition: color 0.3s ease, transform 0.2s ease;
  display: inline-block;

  &:hover {
    color: var(--a-accent);
    transform: translateX(rem(5));
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
