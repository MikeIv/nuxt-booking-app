<script setup lang="ts">
  const route = useRoute();
  const router = useRouter();

  const breadcrumbs = ref<
    Array<{ name: string; path: string; isCurrent: boolean }>
  >([]);

  const getPageTitle = (): string => {
    if (typeof window !== "undefined") {
      const h1 = document.querySelector("h1");
      return h1?.textContent?.trim() || "Страница";
    }
    return "Страница";
  };

  const generateBreadcrumbs = () => {
    const paths = route.path.split("/").filter((path) => path);
    const crumbs: Array<{ name: string; path: string; isCurrent: boolean }> =
      [];

    if (route.path !== "/") {
      crumbs.push({
        name: "Главная / Бронирование",
        path: "/",
        isCurrent: false,
      });
    }

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      const isLast = index === paths.length - 1;
      let name = path.charAt(0).toUpperCase() + path.slice(1);

      if (isLast) {
        name = getPageTitle();
      }

      crumbs.push({
        name,
        path: currentPath,
        isCurrent: isLast,
      });
    });

    breadcrumbs.value = crumbs;
  };

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        generateBreadcrumbs();
      });
    },
  );

  onMounted(() => {
    generateBreadcrumbs();
  });

  const navigateTo = (path: string) => {
    if (path !== route.path) {
      router.push(path);
    }
  };
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" :class="$style.breadcrumbs">
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
