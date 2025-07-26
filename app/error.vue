<script setup lang="ts">
  import type { NuxtError } from "#app";

  const props = defineProps({
    error: {
      type: Object as () => NuxtError,
      required: false,
      default: undefined,
    },
  });

  const handleError = () => clearError({ redirect: "/" });

  console.log("Error", props.error);
</script>

<template>
  <div :class="$style.container">
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else>An error occurred</h1>
    <p>{{ error.message }}</p>
    <button :class="$style.button" @click="handleError">Go back home</button>
  </div>
</template>

<style module lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: rem(32);
  }
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding: rem(16);
  }
</style>
