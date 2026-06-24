<script setup lang="ts">
  import {
    validateGuestField,
    type GuestData,
    type FormField,
  } from "~/composables/usePersonalForm";
  import { additionalGuestFieldsRules, guestFieldsRules } from "~/composables/useFormValidation";
  import UiInput from "~/components/ui/Input.vue";
  import UiOptionSelect from "~/components/ui/OptionSelect.vue";
  import { countriesRu } from "~/utils/countries";
  import { usePhoneMask } from "~/composables/usePhoneMask";

  interface Props {
    guest: GuestData;
    fields: FormField[];
    errors?: Partial<GuestData>;
    guestTitle?: string;
    showRemove?: boolean;
    optionalContactFields?: boolean;
  }

  interface Emits {
    (e: "update:guest", value: GuestData): void;
    (e: "remove"): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    errors: () => ({}),
    guestTitle: "Основной гость",
    showRemove: false,
    optionalContactFields: false,
  });

  const emit = defineEmits<Emits>();

  const emailBlurError = ref<string | null>(null);

  const displayErrors = computed(() => ({
    ...(emailBlurError.value ? { email: emailBlurError.value } : {}),
    ...props.errors,
  }));

  const guestValidationRules = computed(() =>
    props.optionalContactFields ? additionalGuestFieldsRules : guestFieldsRules,
  );

  const validateEmail = (guest: GuestData) => {
    emailBlurError.value = validateGuestField(
      guest,
      "email",
      guestValidationRules.value,
    );
  };

  const {
    handlePhoneInput,
    handlePhoneKeydown,
    handlePhonePaste,
    handlePhoneFocus,
    handlePhoneBlur,
    getDisplayValue,
  } = usePhoneMask();

  const updateField = (key: keyof GuestData, value: string | undefined) => {
    const nextGuest = { ...props.guest, [key]: value ?? "" };
    emit("update:guest", nextGuest);

    if (key === "email" && emailBlurError.value !== null) {
      validateEmail(nextGuest);
    }
  };

  const onFieldBlur = (field: FormField) => {
    if (field.key === "email") {
      validateEmail(props.guest);
    }
  };

  const updatePhone = (value: string) => {
    updateField("phone", value);
  };

  const onPhoneBeforeInput = (event: InputEvent) => {
    handlePhoneInput(event, updatePhone);
  };

  const onPhoneKeydown = (event: KeyboardEvent) => {
    handlePhoneKeydown(event, updatePhone);
  };

  const onPhonePaste = (event: ClipboardEvent) => {
    handlePhonePaste(event, updatePhone);
  };

  const onPhoneFocus = (event: Event) => {
    handlePhoneFocus(event, props.guest.phone || "", updatePhone);
  };

  const onPhoneBlur = (event: Event) => {
    handlePhoneBlur(event, props.guest.phone || "", updatePhone);
  };
</script>

<template>
  <div :class="$style.guestBlock">
    <div v-if="showRemove" :class="$style.guestHeader">
      <span :class="$style.guestTitle">{{ guestTitle }}</span>
      <Button
        type="button"
        unstyled
        :class="$style.removeButton"
        @click="$emit('remove')"
      >
        <UIcon name="i-close" :class="$style.icon" />
      </Button>
    </div>
    <div
      v-for="field in fields"
      :key="field.key"
      :class="$style.inputItem"
    >
      <UiOptionSelect
        v-if="field.key === 'citizenship'"
        :model-value="guest[field.key] ?? ''"
        :options="countriesRu"
        :placeholder="field.placeholder"
        :invalid="Boolean(displayErrors[field.key])"
        :aria-label="field.placeholder"
        variant="personal"
        searchable
        search-placeholder="Поиск страны..."
        @update:model-value="updateField(field.key, $event)"
      />
      <UiInput
        v-else-if="field.key !== 'phone'"
        :model-value="guest[field.key] ?? ''"
        :type="field.type"
        :placeholder="field.placeholder"
        variant="personal"
        :invalid="Boolean(displayErrors[field.key])"
        @update:model-value="updateField(field.key, $event)"
        @blur="onFieldBlur(field)"
      />
      <UiInput
        v-else
        :model-value="getDisplayValue(guest.phone)"
        type="tel"
        inputmode="numeric"
        autocomplete="tel"
        :placeholder="field.placeholder"
        variant="personal"
        :invalid="Boolean(displayErrors[field.key])"
        @update:model-value="updatePhone"
        @before-input="onPhoneBeforeInput"
        @keydown="onPhoneKeydown"
        @paste="onPhonePaste"
        @focus="onPhoneFocus"
        @blur="onPhoneBlur"
      />
      <Message
        v-if="displayErrors[field.key]"
        severity="error"
        size="small"
        variant="simple"
        unstyled
        :class="$style.errorMessage"
      >
        {{ displayErrors[field.key] }}
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
    margin: 0;
    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
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
    padding: 0;
    font-family: var(--a-font-body);
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
    position: relative;
    width: 100%;
    @media (min-width: #{size.$desktopMedium}) {
      flex: 1 1 calc(50% - rem(12));
      min-width: 0;
      width: auto;
    }
  }

  .errorMessage {
    margin-top: rem(8);
    font-family: var(--a-font-body);
    font-size: rem(14);
    color: var(--a-text-accent);
  }
</style>
