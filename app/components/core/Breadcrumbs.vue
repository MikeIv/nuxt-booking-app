<script setup lang="ts">
  import {
    BREADCRUMB_HOME_LABEL,
    getBreadcrumbRouteTitle,
  } from "~/utils/breadcrumbs";

  const route = useRoute();
  const router = useRouter();

  type BreadcrumbItem = { name: string; path: string; isCurrent: boolean };

  const breadcrumbs = ref<BreadcrumbItem[]>([]);

  const getPageHeadingTitle = (): string | null => {
    if (typeof window === "undefined") return null;

    const heading = document.querySelector("main h1[data-breadcrumb], main h1");
    if (!heading) return null;

    return (
      heading.getAttribute("data-breadcrumb")?.trim() ||
      heading.textContent?.trim() ||
      null
    );
  };

  const areCrumbsEqual = (a: BreadcrumbItem[], b: BreadcrumbItem[]): boolean =>
    a.length === b.length &&
    a.every(
      (crumb, index) =>
        crumb.name === b[index]?.name &&
        crumb.path === b[index]?.path &&
        crumb.isCurrent === b[index]?.isCurrent,
    );

  const generateBreadcrumbs = () => {
    const paths = route.path.split("/").filter((path) => path);
    const crumbs: BreadcrumbItem[] = [
      {
        name: BREADCRUMB_HOME_LABEL,
        path: "/",
        isCurrent: false,
      },
    ];

    let currentPath = "";

    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const isLast = i === paths.length - 1;

      crumbs.push({
        name: isLast
          ? getPageHeadingTitle() || getBreadcrumbRouteTitle(currentPath)
          : getBreadcrumbRouteTitle(currentPath),
        path: currentPath,
        isCurrent: isLast,
      });
    }

    if (areCrumbsEqual(breadcrumbs.value, crumbs)) return;

    breadcrumbs.value = crumbs;
  };

  const mainTarget = ref<HTMLElement | null>(null);

  const scheduleBreadcrumbUpdate = () => {
    mainTarget.value = document.querySelector("main");
    nextTick(generateBreadcrumbs);
  };

  const debouncedBreadcrumbUpdate = useDebounceFn(generateBreadcrumbs, 50);

  watch(() => route.path, scheduleBreadcrumbUpdate, { immediate: true });

  useMutationObserver(
    mainTarget,
    debouncedBreadcrumbUpdate,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-breadcrumb"],
    },
  );

  const navigateTo = (path: string) => {
    if (path !== route.path) {
      router.push(path);
    }
  };
</script>

<template>
  <nav v-if="breadcrumbs.length > 1" :class="$style.breadcrumbs">
    <div :class="$style.container">
      <div
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        :class="$style.item"
      >
        <span
          v-if="!crumb.isCurrent"
          :class="$style.link"
          @click="navigateTo(crumb.path)"
        >
          {{ crumb.name }}
        </span>
        <span v-else :class="$style.current">
          {{ crumb.name }}
        </span>
        <span v-if="index < breadcrumbs.length - 1" :class="$style.separator">
          /
        </span>
      </div>
    </div>
  </nav>
</template>

<style module lang="scss">
  .breadcrumbs {
    padding: rem(12) 0;
    background-color: var(--a-white);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .item {
    display: flex;
    align-items: center;
    font-family: "Inter", sans-serif;
  }

  .link {
    color: var(--a-black);
    text-decoration: none;
    cursor: pointer;
    font-size: rem(16);
    transition: color 0.2s ease;

    &:hover {
      color: #0056b3;
      text-decoration: underline;
    }
  }

  .current {
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-black);
  }

  .separator {
    color: #6c757d;
    margin: 0 8px;
    font-size: 14px;
  }
</style>
