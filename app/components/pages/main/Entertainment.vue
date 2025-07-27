<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock :id="anchorId" title="Досуг" :has-two-columns="true">
    <template #left-column>
      <h2>Досуг</h2>
    </template>
    <template #right-column>
      <div>Досуг...</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
