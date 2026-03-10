<script setup lang="ts">
  interface SocialItem {
    href: string;
    label: string;
    icon: string;
    text?: string;
  }

  const socialLinks: SocialItem[] = [
    {
      href: "https://t.me/",
      label: "Telegram",
      icon: "i-telegram",
      text: "Russia_Hotel",
    },
    {
      href: "https://vk.com/",
      label: "ВКонтакте",
      icon: "i-vk",
      text: "Russia_Hotel",
    },
  ];
</script>

<template>
  <section :class="$style.socialMedia" aria-label="Социальные сети">
    <div
      v-for="item in socialLinks"
      :key="item.href"
      :class="$style.socialMediaItem"
    >
      <a
        :class="$style.socialMediaItemLink"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="item.label"
      >
        <div :class="$style.iconBox" aria-hidden="true">
          <UIcon :name="item.icon" :class="$style.socialIcon" />
        </div>
        <span v-if="item.text" :class="$style.socialMediaText">
          {{ item.text }}
        </span>
      </a>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .socialMedia {
    display: flex;
    flex-direction: column;
    padding: 0;

    @media (max-width: #{size.$tabletMax}) {
      width: rem(166);
    }

    @media (max-width: rem(415)) {
      width: rem(110);
    }
  }

  .socialMediaItem {
    margin-bottom: rem(10);
  }

  .socialMediaItemLink {
    display: flex;
    flex-direction: row;
    text-decoration: none;

    &:hover {
      text-decoration: none;
    }
  }

  .iconBox {
    width: rem(34);
    height: rem(34);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .socialIcon {
    width: rem(34);
    height: rem(34);
    color: var(--secondary);
  }

  .socialMediaText {
    font: 400 10px/1 "Futura PT", sans-serif;
    padding-left: rem(15);
    letter-spacing: 0;
    color: var(--secondary);
    opacity: 0.7;
  }
</style>
