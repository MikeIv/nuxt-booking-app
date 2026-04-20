<script setup lang="ts">
  type ButtonVariant = "primary" | "dark" | "ghost" | "danger" | "icon" | "text";
  type ButtonSize = "m" | "l" | "xl" | "icon40";
  type ButtonRadius = "default" | "round";
  type ButtonSeverity = "primary" | "secondary" | "contrast" | "danger";
  type IconPosition = "left" | "right";

  const props = withDefaults(
    defineProps<{
      variant?: ButtonVariant;
      severity?: ButtonSeverity;
      size?: ButtonSize;
      radius?: ButtonRadius;
      round?: boolean;
      disabled?: boolean;
      loading?: boolean;
      label?: string;
      unstyled?: boolean;
      type?: "button" | "submit" | "reset";
      icon?: string;
      iconPosition?: IconPosition;
      iconSize?: number | string;
    }>(),
    {
      variant: "primary",
      severity: "primary",
      size: "m",
      radius: "default",
      round: false,
      disabled: false,
      loading: false,
      label: "",
      unstyled: false,
      type: "button",
      icon: "",
      iconPosition: "left",
      iconSize: "",
    },
  );

  const resolvedVariant = computed<ButtonVariant>(() => {
    if (props.variant) {
      return props.variant;
    }

    if (props.severity === "danger") {
      return "danger";
    }

    if (props.severity === "secondary" || props.severity === "contrast") {
      return "dark";
    }

    return "primary";
  });

  const resolvedRadiusClass = computed(() => {
    if (props.round || props.radius === "round") {
      return "round";
    }

    return "radiusDefault";
  });

  const isDisabled = computed(() => props.disabled || props.loading);
  const attrs = useAttrs();
  const hasIcon = computed(() => Boolean(props.icon));
  const shouldUseSizedStyles = computed(() => resolvedVariant.value !== "text");
  const iconStyle = computed<Record<string, string> | undefined>(() => {
    if (!hasIcon.value || props.iconSize === "") {
      return undefined;
    }

    const sizeValue =
      typeof props.iconSize === "number" ? `${props.iconSize}px` : props.iconSize;

    return { "--ui-btn-icon-size": sizeValue };
  });
</script>

<template>
  <button
    v-bind="attrs"
    :type="props.type"
    :disabled="isDisabled"
    :aria-busy="props.loading || undefined"
    :class="[
      props.unstyled
        ? undefined
        : [
            $style.btn,
            $style[resolvedVariant],
            shouldUseSizedStyles ? $style[props.size] : undefined,
            shouldUseSizedStyles ? $style[resolvedRadiusClass] : undefined,
            {
              [$style.loading]: props.loading,
              [$style.withIcon]: hasIcon,
              [$style.iconRight]: hasIcon && props.iconPosition === 'right',
            },
          ],
    ]"
  >
    <UIcon
      v-if="hasIcon"
      :name="props.icon"
      :class="$style.iconGlyph"
      :style="iconStyle"
      aria-hidden="true"
    />
    <span v-if="$slots.default || props.label">
      <slot>{{ props.label }}</slot>
    </span>
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: var(--a-font-body);
    font-weight: 400;
    line-height: 1;
    border: none;
    box-sizing: border-box;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      pointer-events: none;
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
    }
  }

  .m {
    min-height: rem(44);
    padding: rem(12) rem(44);
    font-size: rem(18);
  }

  .l {
    min-height: rem(54);
    padding: rem(16) rem(48);
    font-size: rem(20);
  }

  .xl {
    min-height: rem(64);
    padding: rem(20) rem(56);
    font-size: rem(24);
  }

  .icon40 {
    width: rem(40);
    height: rem(40);
    min-height: rem(40);
    min-width: rem(40);
    max-width: rem(40);
    padding: 0;
  }

  .radiusDefault {
    border-radius: var(--a-borderR--btn);
  }

  .round {
    border-radius: var(--a-borderR--dialog);
  }

  .loading {
    opacity: 0.8;
  }

  .withIcon {
    gap: rem(8);
  }

  .iconRight {
    flex-direction: row-reverse;
  }

  .iconGlyph {
    width: var(--ui-btn-icon-size, 1em);
    height: var(--ui-btn-icon-size, 1em);
    flex-shrink: 0;
  }

  .primary {
    color: var(--a-text-white);
    background-color: var(--a-primaryBg);

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }
  }

  .dark {
    color: var(--a-text-white);
    background-color: var(--a-blackBg);

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }
  }

  .ghost {
    color: var(--a-text-primary);
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-primary);

    &:hover:not(:disabled) {
      color: var(--a-text-white);
      background-color: var(--a-primaryBg);
    }
  }

  .danger {
    color: var(--a-text-white);
    background-color: var(--a-btnAccentBg);

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }
  }

  .icon {
    color: var(--a-black);
    background: transparent;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;

    &:hover:not(:disabled) {
      color: var(--a-white);
      background-color: var(--a-primaryBg);
      border-color: var(--a-primaryBg);
    }
  }

  .text {
    min-height: auto;
    padding: 0;
    color: var(--a-text-dark);
    font-family: var(--a-font-heading, var(--a-font-body));
    font-size: rem(20);
    line-height: 1.2;
    background-color: transparent;
    border: none;

    &:hover:not(:disabled) {
      color: var(--a-text-accent);
    }
  }
</style>
