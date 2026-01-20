<template>
  <div :class="$style.layout">
    <LayoutHeader />
    <div :class="$style.wrapper" :style="{ marginTop: `${headerHeight}px` }">
      <CoreBreadcrumbs />
      <slot />
    </div>
    <LayoutFooter />
    <CoreSessionTimeoutHandler />
  </div>
</template>

<script setup lang="ts">
  const headerHeight = ref(95);
  let resizeObserver: ResizeObserver | null = null;

  const updateHeaderHeight = () => {
    if (typeof window === "undefined") return;
    
    // Ищем aside элемент внутри header
    const headerSection = document.querySelector("section[class*='section']");
    const headerElement = headerSection?.querySelector("aside");
    
    if (headerElement) {
      const height = headerElement.offsetHeight;
      if (height > 0) {
        headerHeight.value = height;
      }
    }
  };

  onMounted(() => {
    // Ждем следующего тика, чтобы DOM был готов
    nextTick(() => {
      updateHeaderHeight();
      
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });

      const headerSection = document.querySelector("section[class*='section']");
      const headerElement = headerSection?.querySelector("aside");
      
      if (headerElement) {
        resizeObserver.observe(headerElement);
      }

      window.addEventListener("resize", updateHeaderHeight);
    });
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateHeaderHeight);
    }
  });
</script>

<style module lang="scss">
  .layout {
    display: grid;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--a-whiteBg);
    position: relative;
    transition: margin-top 0.2s ease;
  }
</style>
