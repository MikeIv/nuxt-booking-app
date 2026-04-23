<script setup lang="ts">
import UiOptionSelect from "~/components/ui/OptionSelect.vue";
import UiTextarea from "~/components/ui/Textarea.vue";

interface AdditionalField {
  key: string;
  placeholder: string;
  type: "text" | "select" | "textarea";
}

interface Props {
  fields: AdditionalField[];
  formData: Record<string, string>;
}

interface Emits {
  (e: "update:formData", payload: { key: string; value: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const updateField = (key: string, value: string) => {
  emit("update:formData", { key, value });
};

const selectFieldKeys = new Set(["checkInTime", "checkOutTime"]);
const commentFieldKey = "comment";
const timeOptions = [
  { label: "00:00", value: "00:00" },
  { label: "04:00", value: "04:00" },
  { label: "08:00", value: "08:00" },
  { label: "12:00", value: "12:00" },
  { label: "16:00", value: "16:00" },
  { label: "20:00", value: "20:00" },
];

const selectFields = computed(() =>
  props.fields.filter((field) => selectFieldKeys.has(field.key)),
);
const commentField = computed(() =>
  props.fields.find((field) => field.key === commentFieldKey),
);
</script>

<template>
  <div :class="$style.formItem">
    <h3 :class="$style.sectionHeader">Дополнительно</h3>
    <div :class="$style.additionalBlock">
      <div :class="$style.selectsRow">
        <div
          v-for="field in selectFields"
          :key="field.key"
          :class="$style.selectItem"
        >
          <UiOptionSelect
            :model-value="formData[field.key] || ''"
            :options="timeOptions"
            :placeholder="field.placeholder"
            :aria-label="field.placeholder"
            variant="personal"
            @update:model-value="updateField(field.key, $event)"
          />
        </div>
      </div>

      <div v-if="commentField" :class="$style.commentItem">
        <UiTextarea
          :model-value="formData[commentField.key] || ''"
          :placeholder="commentField.placeholder"
          variant="personal"
          :rows="3"
          @update:model-value="updateField(commentField.key, $event)"
        />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.formItem {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  padding: rem(24) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
  &:last-of-type {
    border-bottom: none;
  }
}

.sectionHeader {
  font-family: var(--a-font-body);
  font-size: rem(24);
  font-weight: 400;
  color: var(--a-text-dark);
  margin: 0;
}

.additionalBlock {
  display: flex;
  flex-direction: column;
  gap: rem(20);
}

.selectsRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: rem(20);

  @media (min-width: #{size.$desktopMin}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.selectItem,
.commentItem {
  display: flex;
  width: 100%;
}

.selectItem {
  position: relative;
}
</style>
