<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean;
      invalid?: boolean;
      name?: string;
      rows?: number;
      variant?: "default" | "personal";
    }>(),
    {
      modelValue: "",
      placeholder: "",
      disabled: false,
      readonly: false,
      invalid: false,
      name: undefined,
      rows: 3,
      variant: "default",
    },
  );

  const emit = defineEmits<{
    "update:modelValue": [value: string];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
  }>();

  const onInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit("update:modelValue", target.value);
  };
</script>

<template>
  <label
    :class="[
      $style.root,
      $style[props.variant],
      { [$style.invalid]: props.invalid, [$style.disabled]: props.disabled },
    ]"
  >
    <textarea
      :value="props.modelValue"
      :name="props.name"
      :rows="props.rows"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :aria-invalid="props.invalid || undefined"
      :class="$style.textarea"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
  </label>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    display: flex;
    width: 100%;
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:focus-within:not(.disabled) {
      border-color: var(--a-border-primary-accent);
    }
  }

  .textarea {
    width: 100%;
    border: 0;
    padding: rem(16);
    resize: none;
    background: transparent;
    outline: none;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);

    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .personal {
    min-height: rem(118);
    border-color: var(--a-border-dark);
    border-radius: rem(22);
    box-shadow: var(--a-shadow-summary);

    .textarea {
      padding: rem(18) rem(32);
    }

    .textarea::placeholder {
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

    .textarea {
      color: var(--a-text-light);
      cursor: not-allowed;
    }
  }
</style>
