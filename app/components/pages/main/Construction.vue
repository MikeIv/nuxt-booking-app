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
    title="Этапы строительства"
    :has-two-columns="true"
  >
    <template #left-column>
      <h2>Этапы строительства</h2>
    </template>
    <template #right-column>
      <div>Этапы строительства...</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
