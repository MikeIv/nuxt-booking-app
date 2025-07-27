<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock :id="anchorId" title="СПА" :has-two-columns="true">
    <template #left-column>
      <h2>СПА</h2>
    </template>
    <template #right-column>
      <div>СПА</div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss"></style>
