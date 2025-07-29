<script setup lang="ts">
  import { computed } from "vue";

  interface SocialLink {
    url: string;
    icon: string;
    text?: string;
  }

  const props = defineProps({
    links: {
      type: Array as () => SocialLink[],
      required: true,
      validator: (links: SocialLink[]) =>
        links.every((link) => link.url && link.icon),
    },
    direction: {
      type: String as () => "horizontal" | "vertical",
      default: "horizontal",
    },
    textPosition: {
      type: String as () => "left" | "right" | "bottom",
      default: "right",
    },
    gap: {
      type: String,
      default: "1rem",
    },
    iconSize: {
      type: String,
      default: "1.875rem", // 30px
    },
  });

  const socialLinksClasses = computed(() => [
    props.direction,
    `text-${props.textPosition}`,
  ]);
</script>

<template>
  <div
    :class="[
      $style.socialLinks,
      $style[socialLinksClasses[0]],
      $style[socialLinksClasses[1]],
    ]"
    :style="{ '--gap': props.gap, '--icon-size': props.iconSize }"
  >
    <a
      v-for="link in links"
      :key="link.url"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      :class="$style.socialLink"
    >
      <component :is="link.icon" :class="$style.logo" />
      <span v-if="link.text" :class="$style.text">
        {{ link.text }}
      </span>
    </a>
  </div>
</template>

<style module lang="scss">
  .socialLinks {
    display: flex;
    gap: var(--gap);

    &.horizontal {
      flex-direction: row;
      align-items: center;
    }

    &.vertical {
      flex-direction: column;
      align-items: flex-start;
    }

    &.text-left {
      .socialLink {
        flex-direction: row-reverse;
      }
    }

    &.text-right {
      .socialLink {
        flex-direction: row;
      }
    }

    &.text-bottom {
      .socialLink {
        flex-direction: column;
        align-items: center;
      }
    }
  }

  .socialLink {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .logo {
    width: var(--icon-size);
    height: var(--icon-size);
    object-fit: contain;
    transition: transform 0.3s ease;

    :global(path) {
      fill: var(--secondary);
      transition: fill 0.3s ease;
    }
  }

  .text {
    font-size: 0.875rem;
    transition: color 0.3s ease;
  }
</style>
