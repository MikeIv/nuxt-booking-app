<script setup lang="ts">
  import type { UserProfile } from "~/types/auth";
  import { countriesRu } from "~/utils/countries";
  import BookingSelect from "~/components/booking/BookingSelect.vue";

  interface Props {
    formData: UserProfile;
    isLoading: boolean;
    isSaving: boolean;
    hasChanges: boolean;
  }

  interface Emits {
    (e: "update:formData", value: UserProfile): void;
    (e: "check-changes" | "save"): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();


  const handleFieldChange = () => {
    emit("check-changes");
  };

  // Вычисляемые свойства для каждого поля с геттерами и сеттерами
  const name = computed({
    get: () => props.formData.name,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, name: value });
      handleFieldChange();
    },
  });

  const surname = computed({
    get: () => props.formData.surname,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, surname: value });
      handleFieldChange();
    },
  });

  const middleName = computed({
    get: () => props.formData.middle_name,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, middle_name: value });
      handleFieldChange();
    },
  });

  const phone = computed({
    get: () => props.formData.phone,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, phone: value });
      handleFieldChange();
    },
  });

  const email = computed({
    get: () => props.formData.email,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, email: value });
      handleFieldChange();
    },
  });

  const country = computed({
    get: () => props.formData.country,
    set: (value: string) => {
      emit("update:formData", { ...props.formData, country: value });
      handleFieldChange();
    },
  });
</script>

<template>
  <section :class="$style.content" aria-labelledby="personal-heading">
    <h2 id="personal-heading" class="visually-hidden">Личные данные</h2>

    <div v-if="isLoading" :class="$style.loadingIndicator">Загрузка данных профиля...</div>

    <form v-else :class="$style.form" @submit.prevent="emit('save')">
      <div :class="$style.field">
        <label for="name" :class="$style.label">Имя</label>
        <input
          id="name"
          v-model="name"
          :class="$style.input"
          type="text"
          placeholder="Введите имя"
        />
      </div>

      <div :class="$style.field">
        <label for="surname" :class="$style.label">Фамилия</label>
        <input
          id="surname"
          v-model="surname"
          :class="$style.input"
          type="text"
          placeholder="Введите фамилию"
        />
      </div>

      <div :class="$style.field">
        <label for="middle_name" :class="$style.label">Отчество</label>
        <input
          id="middle_name"
          v-model="middleName"
          :class="$style.input"
          type="text"
          placeholder="Введите отчество"
        />
      </div>

      <div :class="$style.field">
        <label for="phone" :class="$style.label">Телефон</label>
        <input
          id="phone"
          v-model="phone"
          :class="$style.input"
          type="tel"
          placeholder="Введите телефон"
        />
      </div>

      <div :class="$style.field">
        <label for="email" :class="$style.label">E-mail</label>
        <input
          id="email"
          v-model="email"
          :class="$style.input"
          type="email"
          placeholder="Введите e-mail"
        />
      </div>

      <div :class="$style.field">
        <label for="country" :class="$style.label">Гражданство</label>
        <BookingSelect
          v-model="country"
          :options="countriesRu"
          placeholder="Выберите страну"
          :searchable="true"
          search-placeholder="Поиск страны..."
        />
      </div>

      <Button
        :label="isSaving ? 'Сохранение...' : 'Изменить'"
        type="submit"
        unstyled
        :class="[$style.saveBtn, { [$style.active]: hasChanges && !isSaving }]"
        :disabled="!hasChanges || isSaving"
      />
    </form>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  :global(.visually-hidden) {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: rem(750);
  }

  .loadingIndicator {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: rem(40);
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    width: 100%;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: rem(5);
  }

  .label {
    @extend :global(.visually-hidden);
  }

  .input {
    width: 100%;
    height: rem(58);
    padding: 0 rem(16);
    font-size: rem(16);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background-color: var(--a-whiteBg);
    font-family: "Inter", sans-serif;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--a-border-primary);
      box-shadow: 0 0 0 2px rgba(191, 157, 124, 0.1);
    }

    &::placeholder {
      color: var(--a-text-light);
    }
  }

  .saveBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: rem(320);
    min-height: rem(44);
    margin: rem(20) 0 0 auto;
    padding: rem(12) rem(44);
    font-family: Inter, sans-serif;
    font-size: rem(18);
    font-weight: 400;
    line-height: 1;
    color: var(--a-text-white);
    background-color: var(--a-blackBg);
    border-radius: var(--a-borderR--btn);
    cursor: not-allowed;
    opacity: 0.6;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .active {
    background-color: var(--a-btnAccentBg);
    opacity: 1;
    cursor: pointer;

    &:hover {
      background-color: var(--a-blackBg);
    }
  }
</style>

