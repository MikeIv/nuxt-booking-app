<script setup lang="ts">
  const router = useRouter();
  const { isVisible } = useVisibility(1000);

  const scrollToAnchor = (anchor: string) => {
    if (import.meta.client) {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push({ path: "/", hash: `#${anchor}` });
      }
    }
  };
</script>

<template>
  <div :class="[$style.navBlock, { [$style.visible]: isVisible }]">
    <div :class="$style.navDivider" />
    <nav :class="$style.navList">
      <button :class="$style.navLink" @click="scrollToAnchor('accommodation')">
        Проживание
      </button>
      <button :class="$style.navLink" @click="scrollToAnchor('restaurants')">
        Рестораны
      </button>
      <button :class="$style.navLink" @click="scrollToAnchor('events')">
        Мероприятия
      </button>
      <button :class="$style.navLink" @click="scrollToAnchor('spa')">
        СПА
      </button>
      <button :class="$style.navLink" @click="scrollToAnchor('entertainment')">
        Досуг
      </button>
      <button :class="$style.navLink" @click="scrollToAnchor('construction')">
        Этапы строительства
      </button>
    </nav>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .navBlock {
    display: none;

    @media (min-width: #{size.$tabletMax}) {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: rem(1200);
      margin: auto;
      opacity: 0;
      transform: translateY(-10px);
      transition:
        opacity 0.8s ease-out,
        transform 0.6s ease-out;
    }
  }

  .visible {
    opacity: 1;
    transform: translateY(0);
  }

  .navDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-whiteBg);
    margin-bottom: rem(20);
    transition: inherit;
  }

  .navList {
    display: flex;
    gap: rem(60);
    list-style: none;
    padding: 0;
    margin: 0;
    transition: inherit;
  }

  .navLink {
    font-family: "Futura PT", sans-serif;
    text-decoration: none;
    color: var(--a-white);
    text-align: center;
    letter-spacing: rem(4);
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary);
    }
  }
</style>
