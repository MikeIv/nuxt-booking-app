<script setup lang="ts">
import type { GuestData, FormField } from "~/composables/usePersonalForm";
import BookingGuestComposition from "~/components/booking/GuestComposition.vue";

interface Props {
  mainGuest: GuestData;
  additionalGuests: GuestData[];
  formFields: FormField[];
  errors: {
    mainGuest: Partial<GuestData>;
    additionalGuests: Array<Partial<GuestData>>;
  };
  guestComposition: {
    adults: number;
    children: number;
  };
  checkboxOptions: Array<{
    id: string;
    key: string;
    label: string;
  }>;
  formData: {
    smsConfirmation: boolean;
    specialOffers: boolean;
  };
  canAddAdditionalGuest: boolean;
}

interface Emits {
  (e: "update:mainGuest", guest: GuestData): void;
  (e: "update:additionalGuest", payload: { index: number; guest: GuestData }): void;
  (e: "remove:additionalGuest", index: number): void;
  (e: "add:additionalGuest"): void;
  (e: "update:formData", payload: { key: string; value: boolean }): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const updateMainGuest = (guest: GuestData) => {
  emit("update:mainGuest", guest);
};

const updateAdditionalGuest = (index: number, guest: GuestData) => {
  emit("update:additionalGuest", { index, guest });
};

const removeAdditionalGuest = (index: number) => {
  emit("remove:additionalGuest", index);
};

const addAdditionalGuest = () => {
  emit("add:additionalGuest");
};

const updateCheckbox = (key: string, value: boolean) => {
  emit("update:formData", { key, value: value as boolean });
};
</script>

<template>
  <div :class="$style.formItem">
    <BookingGuestComposition
      :adults="guestComposition.adults"
      :children="guestComposition.children"
    />
    <BookingGuestFormFields
      :guest="mainGuest"
      :fields="formFields"
      :errors="errors.mainGuest"
      guest-title="Основной гость"
      @update:guest="updateMainGuest"
    />
    <div :class="$style.checkInformBlock">
      <div
        v-for="checkbox in checkboxOptions"
        :key="checkbox.id"
        :class="$style.checkItem"
      >
        <Checkbox
          :model-value="formData[checkbox.key]"
          :input-id="checkbox.id"
          :binary="true"
          :class="$style.checkbox"
          @update:model-value="updateCheckbox(checkbox.key, $event)"
        />
        <label :for="checkbox.id" :class="$style.checkboxLabel">
          {{ checkbox.label }}
        </label>
      </div>
    </div>
    <BookingGuestFormFields
      v-for="(guest, index) in additionalGuests"
      :key="index"
      :guest="guest"
      :fields="formFields"
      :errors="errors.additionalGuests[index]"
      :guest-title="`Гость ${index + 2}`"
      :show-remove="true"
      @update:guest="updateAdditionalGuest(index, $event)"
      @remove="removeAdditionalGuest(index)"
    />
    <Button
      v-if="canAddAdditionalGuest"
      type="button"
      :class="$style.addGuestButton"
      unstyled
      @click="addAdditionalGuest"
    >
      <UIcon
        name="i-icon-plus-person2"
        :class="$style.addGuestIcon"
        aria-hidden="true"
      />
      <span>Добавить гостя (необязательно)</span>
    </Button>
  </div>
</template>

<style module lang="scss">
.formItem {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  padding: rem(24) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
  &:last-of-type {
    border-bottom: none;
  }
}

.checkInformBlock {
  display: flex;
  flex-direction: column;
  gap: rem(16);
}

.checkItem {
  display: flex;
  align-items: flex-start;
  gap: rem(12);
  :global {
    .p-checkbox {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: rem(20);
      height: rem(20);
      min-width: rem(20);
      border: rem(2) solid var(--a-border-light);
      border-radius: rem(4);
      background: var(--a-whiteBg);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .p-checkbox-checked {
      background-color: var(--a-whiteBg);
      border-color: var(--a-border-primary);
      &:before {
        content: "✓";
        color: var(--a-text-primary);
        font-size: rem(14);
        font-weight: bold;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.checkbox {
  margin-top: rem(4);
  &:hover {
    border-color: var(--a-border-primary);
  }
  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .p-checkbox-icon {
    display: none;
  }
}

.checkboxLabel {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  color: var(--a-text-dark);
  line-height: 1.4;
  cursor: pointer;
  margin-top: rem(2);
  flex: 1;
}

.addGuestButton {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: rem(12);
  width: fit-content;
  height: rem(54);
  padding: 0 rem(16);
  border: rem(1) solid var(--a-border-dark);
  border-radius: var(--a-borderR--card);
  background: transparent;
  color: var(--a-text-dark);
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border-color: var(--a-border-primary);
    color: var(--a-text-primary);
    background-color: rgba(var(--a-primaryBg), 0.05);
  }
  &:focus {
    outline: none;
    border-color: var(--a-border-primary);
    box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
  }
}

.addGuestIcon {
  width: rem(18);
  height: rem(18);
  color: var(--a-text-light);
  flex-shrink: 0;
}
</style>
