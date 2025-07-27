<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock :id="anchorId" title="Рестораны" :has-two-columns="true">
    <template #left-column>
      <h2>Рестораны</h2>
    </template>
    <template #right-column>
      <div>Рестораны...</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
