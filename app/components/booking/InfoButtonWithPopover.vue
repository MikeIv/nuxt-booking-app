<script setup lang="ts">
  interface Props {
    /** Уникальный идентификатор для управления popover */
    popoverId: string;
    /** Размер кнопки: 'small' (24x24) или 'medium' (40x40) */
    size?: "small" | "medium";
    /** Aria-label для кнопки */
    ariaLabel: string;
    /** CSS класс для popover */
    popoverClass?: string;
    /** Padding для контента popover */
    popoverPadding?: string;
  }

  withDefaults(defineProps<Props>(), {
    size: "medium",
    popoverClass: "tariffPopover",
    popoverPadding: "12px",
  });

  interface PopoverLike {
    toggle: (event: MouseEvent) => void;
    hide?: () => void;
  }

  const popoverRef = ref<PopoverLike | undefined>();

  function setPopoverRef(el: unknown) {
    if (el) {
      popoverRef.value = el as PopoverLike;
    }
  }

  function togglePopover(event: MouseEvent) {
    const instance = popoverRef.value;
    if (instance && typeof instance.toggle === "function") {
      instance.toggle(event);
    }
  }
</script>

<template>
  <div>
    <Button
      unstyled
      :class="[$style.infoButton, $style[`infoButton_${size}`]]"
      :aria-label="ariaLabel"
      type="button"
      @click="togglePopover"
    >
      <UIcon
        name="i-heroicons-chevron-down-20-solid"
        :class="[$style.chevronIcon, $style[`chevronIcon_${size}`]]"
      />
    </Button>
    <Popover
      :ref="setPopoverRef"
      append-to="body"
      :class="popoverClass"
      :pt="{ content: { style: `padding: ${popoverPadding};` } }"
    >
      <slot />
    </Popover>
  </div>
</template>

<style module lang="scss">
  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .infoButton_small {
    width: rem(24);
    height: rem(24);
    margin-bottom: rem(6);
  }

  .infoButton_medium {
    width: rem(40);
    height: rem(40);
  }

  .chevronIcon {
    color: var(--a-black);
  }

  .chevronIcon_small {
    width: rem(28);
    height: rem(28);
  }

  .chevronIcon_medium {
    width: rem(28);
    height: rem(28);
  }
</style>
