<script setup lang="ts">
  import type { GuestData, FormField } from "~/composables/usePersonalForm";
  import { countriesRu } from "~/utils/countries";

  interface Props {
    guest: GuestData;
    fields: FormField[];
    errors?: Partial<GuestData>;
    guestTitle?: string;
    showRemove?: boolean;
  }

  interface Emits {
    (e: "update:guest", value: GuestData): void;
    (e: "remove"): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    errors: () => ({}),
    guestTitle: "Основной гость",
    showRemove: false,
  });

  const emit = defineEmits<Emits>();

  const updateField = (key: keyof GuestData, value: string) => {
    emit("update:guest", { ...props.guest, [key]: value });
  };
</script>

<template>
  <div :class="$style.guestBlock">
    <div v-if="showRemove" :class="$style.guestHeader">
      <h4 :class="$style.guestTitle">{{ guestTitle }}</h4>
      <Button
        type="button"
        unstyled
        :class="$style.removeButton"
        @click="$emit('remove')"
      >
        <UIcon name="i-close" :class="$style.icon" />
      </Button>
    </div>
    <h4 v-else :class="$style.guestTitle">{{ guestTitle }}</h4>
    <div
      v-for="field in fields"
      :key="field.key"
      :class="$style.inputItem"
    >
      <BookingSelect
        v-if="field.key === 'citizenship'"
        :model-value="guest[field.key]"
        :options="countriesRu"
        :placeholder="field.placeholder"
        :error="errors[field.key]"
        :searchable="true"
        search-placeholder="Поиск страны..."
        :class="[
          $style.inputSelect,
          errors[field.key] && $style.inputError,
        ]"
        @update:model-value="updateField(field.key, $event)"
      />
      <InputText
        v-else
        :model-value="guest[field.key]"
        :type="field.type"
        :placeholder="field.placeholder"
        :class="[
          $style.input,
          errors[field.key] && $style.inputError,
        ]"
        unstyled
        @update:model-value="updateField(field.key, $event)"
      />
      <Message
        v-if="errors[field.key] && field.key !== 'citizenship'"
        severity="error"
        size="small"
        variant="simple"
        unstyled
        :class="$style.errorMessage"
      >
        {{ errors[field.key] }}
      </Message>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .guestBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: rem(24);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .guestHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: rem(16);
  }

  .guestTitle {
    width: 100%;
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .removeButton {
    width: rem(24);
    height: rem(24);
    min-width: rem(24);
    border-radius: 50%;
    cursor: pointer;
    &:hover {
      background-color: var(--a-btnAccentBg);
      .icon {
        color: var(--a-text-white);
      }
    }
  }

  .icon {
    width: rem(24);
    height: rem(24);
    color: var(--a-text-accent);
  }

  .inputItem {
    display: flex;
    flex-direction: column;
    width: 100%;
    @media (min-width: #{size.$desktopMedium}) {
      width: 45%;
    }
  }

  .input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: rem(54);
    padding: 0 rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
    }
    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .inputSelect {
    display: flex;
    justify-content: space-between;
  }

  .inputError {
    border-color: var(--a-border-accent) !important;
    &:focus {
      border-color: var(--a-error);
      box-shadow: 0 0 0 2px rgba(var(--a-btnAccentBg), 0.1);
    }
  }

  .errorMessage {
    margin-top: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    color: var(--a-text-accent);
  }
</style>

