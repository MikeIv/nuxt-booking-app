<script setup lang="ts">
  const route = useRoute();
  const router = useRouter();

  const breadcrumbs = ref<
    Array<{ name: string; path: string; isCurrent: boolean }>
  >([]);

  const getDefaultTitle = (path: string): string => {
    const pathSegments = path.split("/").filter((segment) => segment);

    if (path === "/rooms") {
      return "Выбор номера";
    } else if (path === "/rooms/tariff") {
      return "Выбор тарифа";
    } else if (path.includes("/rooms") && !path.includes("/tariff")) {
      return "Выбор номера";
    } else if (path.includes("/tariff")) {
      return "Выбор тарифа";
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment) {
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }

    return "Страница";
  };

  const generateBreadcrumbs = () => {
    const paths = route.path.split("/").filter((path) => path);
    const crumbs: Array<{ name: string; path: string; isCurrent: boolean }> =
      [];

    crumbs.push({
      name: "Главная / Бронирование",
      path: "/",
      isCurrent: false,
    });

    let currentPath = "";

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      currentPath += `/${path}`;

      const isLast = i === paths.length - 1;

      let name: string;

      if (isLast) {
        if (typeof window !== "undefined") {
          const h1 = document.querySelector("h1");
          name = h1?.textContent?.trim() || getDefaultTitle(currentPath);
        } else {
          name = getDefaultTitle(currentPath);
        }
      } else {
        name = getDefaultTitle(currentPath);
      }

      crumbs.push({
        name,
        path: currentPath,
        isCurrent: isLast,
      });
    }

    breadcrumbs.value = crumbs;
  };

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        generateBreadcrumbs();
      });
    },
    { immediate: true },
  );

  onMounted(() => {
    nextTick(() => {
      generateBreadcrumbs();
    });
  });

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
