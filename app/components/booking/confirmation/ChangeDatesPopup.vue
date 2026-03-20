<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";

  type Props = {
    isOpen: boolean;
    modelValue: [Date, Date] | null;
    isCalendarOpen: boolean;
    canSubmitDateChange: boolean;
    isChangingDates: boolean;
    changeDatesSuccess: string | null;
    changeDatesError: string | null;
  };

  const props = defineProps<Props>();

  const emit = defineEmits<{
    close: [];
    confirm: [];
    "update:modelValue": [[Date, Date] | null];
    "update:isCalendarOpen": [boolean];
  }>();

  const localDates = computed({
    get: () => props.modelValue,
    set: (value: [Date, Date] | null) => emit("update:modelValue", value),
  });
</script>

<template>
  <Popup
    :is-open="isOpen"
    max-width="720px"
    title="Изменить даты"
    @close="emit('close')"
  >
    <template #content>
      <div
        :class="[
          $style.changeDatesPopupContent,
          isCalendarOpen ? $style.changeDatesPopupContentExpanded : undefined,
        ]"
      >
        <p :class="$style.changeDatesPopupText">
          <span :class="$style.changeDatesPopupTextLine">
            Выберите новые <strong>даты заезда и выезда</strong>.
          </span>
          <span :class="$style.changeDatesPopupTextLine">
            Мы проверим доступность выбранного номера и услуг.
          </span>
        </p>

        <div :class="$style.changeDatesPicker">
          <CoreDatePicker
            v-model="localDates"
            :teleport="false"
            @open="emit('update:isCalendarOpen', true)"
            @closed="emit('update:isCalendarOpen', false)"
          />
        </div>

        <div :class="$style.changeDatesPopupActions">
          <Button
            label="Изменить"
            class="btn__bs dark"
            unstyled
            :disabled="!canSubmitDateChange"
            @click="emit('confirm')"
          />
          <Button
            label="Отмена"
            class="btn__bs danger"
            unstyled
            :disabled="isChangingDates"
            @click="emit('close')"
          />
        </div>

        <p v-if="isChangingDates" :class="$style.changeDatesPopupStatus">
          Проверяем доступность и меняем даты…
        </p>
        <p v-else-if="changeDatesSuccess" :class="$style.changeDatesPopupSuccess">
          {{ changeDatesSuccess }}
        </p>
        <p v-else-if="changeDatesError" :class="$style.changeDatesPopupError">
          {{ changeDatesError }}
        </p>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .changeDatesPopupContent {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: 0 rem(24);
  }

  .changeDatesPopupText {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(20);
    line-height: 1.5;
    color: var(--a-text-dark);
    text-align: center;
  }

  .changeDatesPopupTextLine {
    display: block;
  }

  .changeDatesPicker {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .changeDatesPopupContent :global(.dp__menu) {
    position: static !important;
    transform: none !important;
    margin-top: rem(12);
    width: 100%;
    max-width: 100%;
  }

  .changeDatesPopupContent :global(.dp__menu_content) {
    width: 100%;
    max-width: 100%;
  }

  .changeDatesPopupContentExpanded {
    padding-bottom: rem(350);
  }

  .changeDatesPopupActions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: center;
      gap: rem(16);
    }

    :global(.btn__bs) {
      width: 100%;

      @media (min-width: #{size.$tablet}) {
        width: auto;
        min-width: rem(180);
      }
    }
  }

  .changeDatesPopupError {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-btnAccentBg);
    text-align: center;
    word-break: break-word;
  }

  .changeDatesPopupStatus {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-light);
    text-align: center;
  }

  .changeDatesPopupSuccess {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--success);
    text-align: center;
    word-break: break-word;
  }
</style>
