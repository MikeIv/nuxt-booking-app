<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    :header="header"
    pt:root:class="auth-popup"
    @update:visible="handleVisibilityChange"
  >
    <slot name="content" />

    <template #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";

  const props = defineProps<{
    visible: boolean;
    header: string;
  }>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
    close: [];
  }>();

  const internalVisible = ref(props.visible);

  watch(
    () => props.visible,
    (newValue) => {
      internalVisible.value = newValue;
    },
  );

  const handleVisibilityChange = (value: boolean) => {
    internalVisible.value = value;
    emit("update:visible", value);

    if (!value) {
      emit("close");
    }
  };
</script>

<style lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .auth-popup {
    &.p-dialog {
      position: relative;
      width: 100%;
      max-width: rem(600);
      max-height: 100%;
      padding: rem(40) rem(30);
      background: var(--a-whiteBg);
      border-radius: rem(20);
      box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.2);
    }

    .p-dialog-content {
      height: 100%;
      overflow-y: visible;
    }

    .p-dialog-header-actions {
      position: absolute;
      top: rem(12);
      right: rem(18);
    }

    .p-button-text.p-button-secondary {
      color: var(--a-text-dark);
    }
    .p-button-text.p-button-secondary:not(:disabled):hover {
      color: var(--a-text-accent);
    }

    .p-dialog-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: rem(24);
      font-family: "Lora", serif;
      font-size: rem(24);
      font-weight: 500;
      line-height: 1.2;
      color: var(--a-text-dark);
    }
  }
</style>
