<script setup lang="ts">
interface AdditionalField {
  key: string;
  placeholder: string;
  type: string;
}

interface Props {
  fields: AdditionalField[];
  formData: Record<string, string>;
}

interface Emits {
  (e: "update:formData", payload: { key: string; value: string }): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const updateField = (key: string, value: string) => {
  emit("update:formData", { key, value });
};
</script>

<template>
  <div :class="$style.formItem">
    <h3 :class="$style.sectionHeader">Дополнительно</h3>
    <div :class="$style.additionalBlock">
      <div
        v-for="field in fields"
        :key="field.key"
        :class="$style.inputItem"
      >
        <InputText
          :model-value="formData[field.key] || ''"
          :type="field.type"
          :placeholder="field.placeholder"
          :class="$style.input"
          unstyled
          @update:model-value="updateField(field.key, $event)"
        />
      </div>
    </div>
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

.sectionHeader {
  font-family: "Inter", sans-serif;
  font-size: rem(24);
  font-weight: 400;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
}

.additionalBlock {
  display: flex;
  flex-direction: column;
  gap: rem(24);
}

.inputItem {
  display: flex;
  flex-direction: column;
  width: 100%;
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
</style>
