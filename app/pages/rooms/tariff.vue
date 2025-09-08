<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults } = storeToRefs(bookingStore);

  console.log("searchResults-TARIF", searchResults);
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор тарифа для номера 1</h1>
    <Booking />

    <section :class="$style.advantages">
      <div :class="$style.infoBlock">
        <h2 :class="$style.advantagesTitle">
          Получите дополнительные преимущества
        </h2>
        <p :class="$style.description">
          Участники программы лояльности Russia Club могут пользоваться
          эксклюзивными предложениями в наших отелях, ресторанах, спа и
          заведениях-партнерах по всему миру.
        </p>
      </div>
      <div :class="$style.btnBlock">
        <button :class="[$style.btn, $style.btnGhost]">Войти</button>
        <button :class="[$style.btn, $style.btnAccent]">
          Зарегистрироваться
        </button>
      </div>
      <div :class="$style.imgBlock">
        <img src="/images/tariff/auth.jpg" alt="номер" />
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);
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

  .advantages {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .infoBlock {
    display: flex;
    flex-direction: column;
  }
  .advantagesTitle {
    margin-bottom: rem(40);
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
  }
  .description {
    margin-bottom: rem(30);
    font-family: "Lora", serif;
    font-size: rem(24);
    color: var(--a-text-dark);
  }
  .btnBlock {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: rem(10) rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    border-radius: var(--a-borderR--btn);
    cursor: pointer;
  }
  .btnGhost {
    margin-bottom: rem(20);
    color: var(--a-text-dark);
    border: 1px solid var(--a-border-dark);
  }
  .btnAccent {
    color: var(--a-text-white);
    background-color: var(--a-blackBg);
  }

  .imgBlock {
    position: relative;
    margin-bottom: rem(40);

    &::before {
      content: "";
      position: absolute;
      bottom: rem(-40);
      left: 0;
      display: block;
      width: 100%;
      height: rem(1);
      background-color: var(--a-border-dark);
    }
    img {
      height: rem(300);
      object-fit: cover;
    }
  }
</style>
