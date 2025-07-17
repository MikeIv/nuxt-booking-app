<template>
  <div class="layout">
    <LayoutsHeader />
    <NuxtLink to="/">
      <img src="~/assets/images/test.svg" alt="My Logo" class="layout__logo" />
    </NuxtLink>

    <slot />
  </div>
</template>