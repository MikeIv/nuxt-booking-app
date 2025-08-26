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
        name: "Главная",
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
  <nav v-if="breadcrumbs.length > 0" class="breadcrumbs">
    <div class="breadcrumbs__container">
      <div
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumbs__item"
      >
        <span
          v-if="!crumb.isCurrent"
          class="breadcrumbs__link"
          @click="navigateTo(crumb.path)"
        >
          {{ crumb.name }}
        </span>
        <span v-else class="breadcrumbs__current">
          {{ crumb.name }}
        </span>
        <span
          v-if="index < breadcrumbs.length - 1"
          class="breadcrumbs__separator"
        >
          /
        </span>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
  .breadcrumbs {
    padding: 12px 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;

    &__container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    &__item {
      display: flex;
      align-items: center;
    }

    &__link {
      color: #007bff;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      transition: color 0.2s ease;

      &:hover {
        color: #0056b3;
        text-decoration: underline;
      }
    }

    &__current {
      color: #6c757d;
      font-size: 14px;
      font-weight: 500;
    }

    &__separator {
      color: #6c757d;
      margin: 0 8px;
      font-size: 14px;
    }
  }

  @media (max-width: 768px) {
    .breadcrumbs {
      &__container {
        padding: 0 16px;
      }

      &__link,
      &__current,
      &__separator {
        font-size: 12px;
      }
    }
  }
</style>
