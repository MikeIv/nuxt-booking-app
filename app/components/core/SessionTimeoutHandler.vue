<!-- app/components/SessionTimeoutHandler.vue -->
<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";
  import { useBookingStore } from "~/stores/booking";

  const router = useRouter();
  const route = useRoute();
  const booking = useBookingStore();

  const isSessionExpired = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const TIMEOUT_MS = 10 * 60 * 1000; // 10 минут для тестирования

  function startTimer() {
    stopTimer();
    timer = setTimeout(() => {
      if (route.path !== "/") {
        isSessionExpired.value = true;
      }
    }, TIMEOUT_MS);
  }

  function stopTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function resetTimer() {
    if (route.path === "/") return;
    startTimer();
  }

  function handleRefresh() {
    isSessionExpired.value = false;
    booking.forceReset();
    router.push("/");
  }

  onMounted(() => {
    if (route.path !== "/") {
      startTimer();
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
    }
  });

  onBeforeUnmount(() => {
    stopTimer();
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keydown", resetTimer);
  });
</script>

<template>
  <Popup
    :is-open="isSessionExpired"
    title="Сессия истекла"
    :show-close-button="false"
  >
    <template #content>
      <div :class="$style.content">
        <p :class="$style.text">К сожалению, Ваша сессия истекла.</p>
        <button class="btn__bs" :class="$style.btn" @click="handleRefresh">
          Обновить поиск
        </button>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: rem(20) rem(24);
  }

  .text {
    margin-bottom: rem(24);
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: rem(21);
    font-weight: 500;
    color: var(--a-text-accent);
    user-select: none;
  }

  .btn {
    margin: 0 auto;
  }
</style>
