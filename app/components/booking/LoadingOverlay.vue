<script setup lang="ts">
  import { storeToRefs } from "pinia";

  const bookingStore = useBookingStore();
  const { loading, loadingMessage } = storeToRefs(bookingStore);
</script>

<template>
  <Teleport to="body">
    <div v-if="loading" :class="$style.globalOverlay">
      <div :class="$style.spinnerContainer">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          stroke-width="4"
          fill="transparent"
          animation-duration="2.5s"
          aria-label="Custom ProgressSpinner"
        />
        <p :class="$style.loadingText">{{ loadingMessage }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .globalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: z.z("modal", "content");
  }

  .spinnerContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(16);
    padding: rem(18);
  }

  .loadingText {
    margin: 0;
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }
</style>
