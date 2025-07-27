<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock :id="anchorId" title="Проживание" :has-two-columns="true">
    <template #left-column>
      <h2>Проживание</h2>
    </template>
    <template #right-column>
      <div>Проживание</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
