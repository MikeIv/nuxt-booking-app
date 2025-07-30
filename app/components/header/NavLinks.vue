<script setup lang="ts">
  import { useI18n } from "vue-i18n";

  const { t, te } = useI18n();

  const props = defineProps({
    links: {
      type: Array as () => Array<{ url: string; text: string }>,
      required: true,
    },
  });

  const emit = defineEmits(["link-click"]);

  const safeTranslate = (key: string) => {
    return te(key) ? t(key) : key;
  };

  const handleLinkClick = () => {
    emit("link-click");
  };

  // Разделение ссылок на две колонки
  const firstColumnLinks = computed(() => {
    return props.links.slice(0, 3);
  });

  const secondColumnLinks = computed(() => {
    return props.links.slice(3);
  });

  const hasSecondColumn = computed(() => {
    return secondColumnLinks.value.length > 0;
  });
</script>

<template>
  <div :class="$style.linksContainer">
    <div :class="$style.leftColumn">
      <a
        v-for="link in firstColumnLinks"
        :key="link.url"
        :href="link.url"
        :class="$style.menuLink"
        @click="handleLinkClick"
      >
        {{ safeTranslate(link.text) }}
      </a>
    </div>
    <div v-if="hasSecondColumn" :class="$style.linksDivider" />
    <div :class="$style.rightColumn">
      <a
        v-for="link in secondColumnLinks"
        :key="link.url"
        :href="link.url"
        :class="$style.menuLink"
        target="_blank"
        @click="handleLinkClick"
      >
        {{ safeTranslate(link.text) }}
      </a>
    </div>
  </div>
</template>

<style module lang="scss">
  .linksContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: rem(24);
    margin-bottom: rem(40);

    @media (min-width: 670px) {
      position: relative;
      flex-direction: row;
      justify-content: center;
      align-items: stretch;
      gap: 0;
    }
  }

  .leftColumn {
    display: flex;
    flex-direction: column;
    gap: rem(18);
    align-items: center;

    @media (min-width: 670px) {
      align-items: flex-end;
      text-align: right;
      padding-right: rem(40);
      width: calc(50% - 0.5px);
    }
  }

  .rightColumn {
    display: flex;
    flex-direction: column;
    gap: rem(18);
    align-items: center;

    @media (min-width: 670px) {
      align-items: flex-start;
      width: calc(50% - 0.5px);
      padding-left: rem(40);
    }
  }

  .linksDivider {
    display: none;

    @media (min-width: 670px) {
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      height: 100%;
      background-color: var(--secondary);
    }
  }

  .menuLink {
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 3vw, 30px);
    color: var(--secondary);
    text-decoration: none;
    transition:
      color 0.3s ease,
      transform 0.2s ease;
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
