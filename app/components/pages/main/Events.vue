<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock
    :id="anchorId"
    title="Мероприятия"
    :has-two-columns="true"
  >
    <template #left-column>
      <h2>Мероприятия</h2>
    </template>
    <template #right-column>
      <div>Мероприятия</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
