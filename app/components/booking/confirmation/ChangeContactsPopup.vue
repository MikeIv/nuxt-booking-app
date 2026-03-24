<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";
  import type { ContactFormData } from "~/types/booking";

  type Props = {
    isOpen: boolean;
    form: ContactFormData;
    canSubmitContactChange: boolean;
    isChangingContacts: boolean;
    changeContactsSuccess: string | null;
    changeContactsError: string | null;
  };

  const props = defineProps<Props>();

  const emit = defineEmits<{
    close: [];
    confirm: [];
    "update:form": [ContactFormData];
  }>();

  const localForm = computed({
    get: () => props.form,
    set: (value: ContactFormData) => emit("update:form", value),
  });
</script>

<template>
  <Popup
    :is-open="isOpen"
    max-width="720px"
    title="Изменить контакт"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.changeContactsPopupContent">
        <p :class="$style.changeContactsPopupText">
          Измените контактные данные для текущего бронирования.
        </p>

        <div :class="$style.changeContactsPopupGrid">
          <input
            v-model.trim="localForm.name"
            :class="$style.changeContactsInput"
            type="text"
            placeholder="Имя"
          />
          <input
            v-model.trim="localForm.surname"
            :class="$style.changeContactsInput"
            type="text"
            placeholder="Фамилия"
          />
          <input
            v-model.trim="localForm.middle_name"
            :class="$style.changeContactsInput"
            type="text"
            placeholder="Отчество"
          />
          <input
            v-model.trim="localForm.phone"
            :class="$style.changeContactsInput"
            type="tel"
            placeholder="Телефон"
          />
          <input
            v-model.trim="localForm.email"
            :class="$style.changeContactsInput"
            type="email"
            placeholder="E-mail"
          />
        </div>

        <div :class="$style.changeContactsPopupActions">
          <Button
            label="Изменить"
            class="btn__bs dark"
            unstyled
            :disabled="!canSubmitContactChange"
            @click="emit('confirm')"
          />
          <Button
            label="Отмена"
            class="btn__bs danger"
            unstyled
            :disabled="isChangingContacts"
            @click="emit('close')"
          />
        </div>

        <p v-if="isChangingContacts" :class="$style.changeContactsPopupStatus">
          Обновляем контактные данные...
        </p>
        <p v-else-if="changeContactsSuccess" :class="$style.changeContactsPopupSuccess">
          {{ changeContactsSuccess }}
        </p>
        <p v-else-if="changeContactsError" :class="$style.changeContactsPopupError">
          {{ changeContactsError }}
        </p>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .changeContactsPopupContent {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: 0 rem(24);
  }

  .changeContactsPopupText {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(18);
    line-height: 1.5;
    color: var(--a-text-dark);
    text-align: center;
  }

  .changeContactsPopupGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      grid-template-columns: repeat(2, 1fr);
      gap: rem(14);
    }
  }

  .changeContactsInput {
    width: 100%;
    min-height: rem(44);
    padding: rem(10) rem(14);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    font-family: var(--a-font-body);
    font-size: rem(16);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);

    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(191, 157, 124, 0.1);
    }
  }

  .changeContactsPopupActions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: center;
      gap: rem(16);
    }
  }

  .changeContactsPopupStatus {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-light);
    text-align: center;
  }

  .changeContactsPopupSuccess {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--success);
    text-align: center;
    word-break: break-word;
  }

  .changeContactsPopupError {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-btnAccentBg);
    text-align: center;
    word-break: break-word;
  }
</style>
