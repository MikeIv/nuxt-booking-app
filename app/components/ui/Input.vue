<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      label?: string;
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean;
      invalid?: boolean;
      name?: string;
      autocomplete?: string;
      type?: "text" | "email" | "tel" | "search" | "number";
      inputmode?:
        | "none"
        | "text"
        | "tel"
        | "url"
        | "email"
        | "numeric"
        | "decimal"
        | "search";
      variant?: "default" | "booking" | "personal";
    }>(),
    {
      modelValue: "",
      label: "",
      placeholder: "",
      disabled: false,
      readonly: false,
      invalid: false,
      name: undefined,
      autocomplete: "off",
      type: "text",
      inputmode: "text",
      variant: "default",
    },
  );

  const emit = defineEmits<{
    "update:modelValue": [value: string];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
    "before-input": [event: InputEvent];
    keydown: [event: KeyboardEvent];
    paste: [event: ClipboardEvent];
  }>();

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.value);
  };

  const onBeforeInput = (event: Event) => {
    emit("before-input", event as InputEvent);
  };

  const onKeydown = (event: Event) => {
    emit("keydown", event as KeyboardEvent);
  };

  const onPaste = (event: Event) => {
    emit("paste", event as ClipboardEvent);
  };

  const attrs = useAttrs();
</script>

<template>
  <label
    :class="[
      $style.root,
      $style[props.variant],
      { [$style.invalid]: props.invalid, [$style.disabled]: props.disabled },
    ]"
  >
    <span v-if="props.label" :class="$style.label">{{ props.label }}</span>
    <input
      :value="props.modelValue"
      :type="props.type"
      :name="props.name"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :inputmode="props.inputmode"
      :aria-invalid="props.invalid || undefined"
      :class="$style.input"
      v-bind="attrs"
      @input="onInput"
      @beforeinput="onBeforeInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    >
  </label>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: rem(67);
    padding: rem(8) rem(12) rem(6);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover:not(.disabled) {
      border-color: var(--a-border-primary-accent);
    }

    &:focus-within:not(.disabled) {
      border-color: var(--a-border-primary-accent);
    }
  }

  .label {
    font-family: var(--a-font-body);
    font-size: rem(12);
    line-height: 1.2;
    color: var(--a-text-light);
  }

  .input {
    margin-top: rem(4);
    border: 0;
    padding: 0;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);
    background: transparent;
    outline: none;

    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .booking {
    border-color: #c8c8c8;

    &:hover:not(.disabled),
    &:focus-within:not(.disabled) {
      border-color: #928b7d;
    }

    .label {
      font-family: var(--a-font-select, "Inter", sans-serif);
      font-size: rem(16);
      color: #525252;
    }

    .input {
      margin-top: rem(2);
      font-family: var(--a-font-select, "Inter", sans-serif);
      font-size: var(--ds-typo-size-select, rem(26));
      line-height: var(--ds-typo-line-select, 1);
      font-weight: var(--ds-typo-weight-select, 400);
      color: #000;
    }
  }

  .personal {
    min-height: rem(58);
    padding: 0 rem(32);
    justify-content: center;
    border-color: var(--a-border-dark);
    border-radius: rem(22);
    box-shadow: var(--a-shadow-summary);

    .input {
      margin-top: 0;
      width: 100%;
      font-family: var(--a-font-body);
      font-size: rem(16);
      line-height: 1.2;
      color: var(--a-text-dark);
    }

    .input::placeholder {
      color: var(--a-text-dark);
      opacity: 0.3;
    }
  }

  .invalid {
    border-color: var(--a-border-accent);
  }

  .disabled {
    border-color: var(--a-border);
    background: var(--a-lightBg);

    .label,
    .input {
      color: var(--a-text-light);
      cursor: not-allowed;
    }
  }
</style>
