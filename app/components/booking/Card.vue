<script setup lang="ts">
  defineProps({
    room: {
      type: Object,
      required: true,
    },
  });
</script>

<template>
  <div :class="$style.card">
    <div :class="$style.slider">
      <img src="/images/room/room-01.jpg" alt="номер" />
    </div>
    <span :class="$style.title">{{ room?.title }}</span>
  </div>
</template>

<style module lang="scss">
  .card {
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: rem(18) rem(14);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    border-radius: var(--a-borderR--card);
    overflow: hidden;
  }

  .title {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: bold;
    color: var(--a-text-dark);
  }

  .slider {
    display: flex;
    width: 100%;
    margin-bottom: rem(20);

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
  }
</style>
