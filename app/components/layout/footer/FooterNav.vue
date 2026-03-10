<script setup lang="ts">
  import type { SiteLink } from "~/utils/siteLinks";
  import { FOOTER_NAV_LINKS } from "~/utils/siteLinks";

  const props = withDefaults(
    defineProps<{
      links?: SiteLink[];
    }>(),
    { links: undefined },
  );

  const navLinks = computed(() => props.links ?? FOOTER_NAV_LINKS);
</script>

<template>
  <nav :class="$style.menu" aria-label="Навигация">
    <ul :class="$style.navList">
      <li
        v-for="link in navLinks"
        :key="link.url"
        :class="$style.navItem"
      >
        <NuxtLink
          v-if="!link.external"
          :to="link.url"
          :class="$style.navLink"
        >
          {{ link.label }}
        </NuxtLink>
        <a
          v-else
          :href="link.url"
          :class="$style.navLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .menu {
    /* grid-area задаётся родителем */
  }

  .navList {
    list-style: none;
    padding: 0;
    margin: 0;

    @media (max-width: #{size.$tabletMin}) {
      column-count: 2;
      column-gap: rem(5);
    }
  }

  .navItem {
    margin-bottom: rem(2);
    line-height: rem(30);
  }

  .navLink {
    display: block;
    color: var(--secondary);
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
    font-family: "Futura PT", sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 2.1;
    letter-spacing: 1px;

    @media (max-width: rem(415)) {
      font-size: 12px;
    }

    &:hover {
      text-decoration: none;
      color: var(--secondary);
    }

    &.router-link-active {
      font-weight: bold;
    }
  }
</style>
