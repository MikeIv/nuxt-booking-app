<script setup lang="ts">
  import type { UserProfile } from "~/types/auth";

  defineProps<{
    formData: UserProfile;
    isLoading: boolean;
    isSaving: boolean;
    hasChanges: boolean;
  }>();

  defineEmits<{
    "update:formData": [value: UserProfile];
    "check-changes": [];
    save: [];
  }>();
</script>

<template>
  <section :class="$style.content" aria-labelledby="personal-heading">
    <h2 id="personal-heading" class="visually-hidden">Личные данные</h2>

    <div v-if="isLoading" :class="$style.loadingIndicator">Загрузка данных профиля...</div>

    <div v-else :class="$style.form">
      <div :class="$style.field">
        <label for="name" :class="$style.label">Имя</label>
        <input
          id="name"
          :value="formData.name"
          :class="$style.input"
          type="text"
          placeholder="Введите имя"
          readonly
        >
      </div>

      <div :class="$style.field">
        <label for="surname" :class="$style.label">Фамилия</label>
        <input
          id="surname"
          :value="formData.surname"
          :class="$style.input"
          type="text"
          placeholder="Введите фамилию"
          readonly
        >
      </div>

      <div :class="$style.field">
        <label for="middle_name" :class="$style.label">Отчество</label>
        <input
          id="middle_name"
          :value="formData.middle_name"
          :class="$style.input"
          type="text"
          placeholder="Введите отчество"
          readonly
        >
      </div>

      <div :class="$style.field">
        <label for="phone" :class="$style.label">Телефон</label>
        <input
          id="phone"
          :value="formData.phone"
          :class="$style.input"
          type="tel"
          placeholder="Введите телефон"
          readonly
        >
      </div>

      <div :class="$style.field">
        <label for="email" :class="$style.label">E-mail</label>
        <input
          id="email"
          :value="formData.email"
          :class="$style.input"
          type="email"
          placeholder="Введите e-mail"
          readonly
        >
      </div>

      <div :class="$style.field">
        <label for="country" :class="$style.label">Гражданство</label>
        <input
          id="country"
          :value="formData.country"
          :class="$style.input"
          type="text"
          placeholder="Выберите страну"
          readonly
        >
      </div>
    </div>
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
    gap: rem(24);
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
    padding: 0 rem(27) 0 rem(38);
    font-size: rem(20);
    color: var(--a-text-dark);
    border: rem(0.5) solid var(--a-border-dark);
    border-radius: var(--a-borderR--card);
    background-color: var(--a-whiteBg);
    font-family: var(--a-font-body);
    box-shadow: var(--a-shadow-weekday);
    cursor: default;

    @media (min-width: #{size.$tablet}) {
      padding: 0 rem(16);
      font-size: rem(16);
      border: rem(1) solid var(--a-border-light);
      border-radius: var(--a-borderR--input);
      box-shadow: none;
    }

    &::placeholder {
      color: var(--a-text-light);
    }
  }
</style>
