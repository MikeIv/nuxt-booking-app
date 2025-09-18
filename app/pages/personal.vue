<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useToast as usePrimeToast } from "primevue/usetoast";
  import { reactive } from "vue";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs } =
    storeToRefs(bookingStore);

  console.log("searchResults-TARIF", searchResults.value);
  console.log("selectedRoomType", selectedRoomType.value);
  console.log("roomTariffs", roomTariffs.value);

  const toast = usePrimeToast();

  // Данные формы
  const formData = reactive({
    username: "",
  });

  // Ошибки валидации
  const errors = reactive({
    username: "",
  });

  // Валидация формы
  const validateForm = () => {
    let isValid = true;

    // Сброс ошибок
    errors.username = "";

    // Валидация username
    if (!formData.username.trim()) {
      errors.username = "Username is required.";
      isValid = false;
    }

    return isValid;
  };

  const onFormSubmit = () => {
    if (validateForm()) {
      toast.add({
        severity: "success",
        summary: "Form is submitted.",
        life: 3000,
      });
      console.log("Form data:", formData);
    } else {
      toast.add({
        severity: "error",
        summary: "Please fix validation errors.",
        life: 3000,
      });
    }
  };
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Личные данные</h1>

    <Booking />

    <section :class="$style.personalBlock">
      <NuxtLink to="/rooms/tariff" :class="$style.return"
        >Назад к тарифам</NuxtLink
      >
      <h2 :class="$style.personalTitle">Введите свои данные</h2>
      <div :class="$style.wrapper">
        <h3 :class="$style.sectionHeader">Я бронирую</h3>

        <div :class="$style.btnBlock">
          <Button label="Для себя" class="btn__bs" unstyled />
          <Button label="Для другого" class="btn__bs ghost" unstyled />
        </div>
        <p :class="$style.personalNote">
          Укажите данные основного гостя. Остальных гостей — при заселении
        </p>
      </div>
    </section>

    <section :class="$style.personalBlock">
      <h3 :class="$style.sectionHeader">Данные гостей</h3>
      <form
        class="flex flex-col gap-4 w-full sm:w-56"
        @submit.prevent="onFormSubmit"
      >
        <div class="flex flex-col gap-1">
          <InputText
            v-model="formData.username"
            type="text"
            placeholder="Username"
            :class="{ 'p-invalid': errors.username }"
          />
          <Message
            v-if="errors.username"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ errors.username }}
          </Message>
        </div>
        <Button type="submit" severity="secondary" label="Submit" />
      </form>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }

  .personalBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(40) rem(20);
  }

  .return {
    position: relative;
    margin-bottom: rem(40);
    padding-left: rem(30);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);

    &:before {
      content: "<";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 10px;
    }
  }
  .personalTitle {
    margin-bottom: rem(25);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 0 rem(25) 0;
    border-bottom: rem(1) solid var(--a-border-dark);
  }
  .sectionHeader {
    margin-bottom: rem(25);
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 400;
    color: var(--a-text-dark);
  }
  .btnBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    margin-bottom: rem(25);
  }
  .personalNote {
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-light);
  }
</style>
