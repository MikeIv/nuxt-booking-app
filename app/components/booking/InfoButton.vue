<script setup lang="ts">
  interface Props {
    iconName: string;
    ariaLabel?: string;
    ariaExpanded?: boolean;
    dataPopupButton?: boolean;
  }

  const _props = withDefaults(defineProps<Props>(), {
    ariaLabel: "",
    ariaExpanded: undefined,
    dataPopupButton: false,
  });

  const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
  }>();

  const handleClick = (event: MouseEvent) => {
    emit("click", event);
  };
</script>

<template>
  <button
    :class="$style.infoButton"
    :aria-label="ariaLabel || undefined"
    :aria-expanded="ariaExpanded !== undefined ? ariaExpanded : undefined"
    :data-popup-button="dataPopupButton ? '' : undefined"
    @click="handleClick"
  >
    <UIcon :name="iconName" :class="$style.icon" />
  </button>
</template>

<style module lang="scss">
  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(40);
    height: rem(40);
    min-width: rem(40);
    max-width: rem(40);
    flex-shrink: 0;
    flex-grow: 0;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-primaryBg);
      border: none;

      .icon {
        color: var(--a-white);
      }
    }
  }

  .icon {
    width: rem(30);
    height: rem(30);
    color: var(--a-black);
  }
</style>
