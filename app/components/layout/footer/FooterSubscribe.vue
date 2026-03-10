<script setup lang="ts">
  const agreementAccepted = ref(true);
</script>

<template>
  <section :class="$style.cellForm">
    <h2 :class="$style.text">БУДЬ В КУРСЕ ПОСЛЕДНИХ НОВОСТЕЙ</h2>
    <form :class="$style.subscribeForm" @submit.prevent>
      <fieldset :class="$style.emailFieldset">
        <label :class="$style.emailLabel" for="footer-email">
          <span class="sr-only">E-mail для подписки</span>
          <input
            id="footer-email"
            type="email"
            name="email"
            :class="$style.emailInput"
            placeholder="E-MAIL"
            autocomplete="email"
          >
        </label>
      </fieldset>
      <div :class="$style.agreement">
        <UCheckbox
          v-model="agreementAccepted"
          size="lg"
          :ui="{
            base: $style.checkboxBase,
            container: $style.checkboxContainer,
            indicator: $style.checkboxIndicator,
            icon: $style.checkboxIcon,
          }"
        />
        <p :class="$style.agreementText">
          Даю согласие на обработку
          <a href="#" :class="$style.agreementTextLink">
            персональных данных
          </a>
        </p>
      </div>
      <UButton label="ПОДПИСАТЬСЯ" :class="$style.subscribeBtn" type="submit" />
    </form>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cellForm {
    display: flex;
    flex-direction: column;
    max-width: rem(270);
  }

  .text {
    font: 600 14px/2.1 "Futura PT", sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--secondary);
    opacity: 1;
    margin: 0 0 rem(10);
    margin-top: 0;

    @media (max-width: rem(415)) {
      font-size: 12px;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .subscribeForm {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .emailFieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  .emailLabel {
    display: block;
    max-width: rem(270);
    margin-bottom: rem(10);
  }

  .emailInput {
    width: 100%;
    height: rem(50);
    padding-left: 0;
    border: 0;
    border-bottom: rem(1) solid var(--secondary);
    border-radius: 0;
    box-shadow: none;
    outline: none;
    background: transparent;
    font: 600 14px/2.1 "Futura PT", sans-serif;
    letter-spacing: 1px;

    &::placeholder {
      color: var(--secondary);
      opacity: 75%;
    }
    &:hover {
      box-shadow: none;
      outline: none;
    }
    &:focus {
      outline: none;
      border-bottom-color: var(--secondary);
    }

    @media (max-width: #{size.$tablet}) {
      height: rem(30);
      font-size: rem(14);
    }
  }

  .checkboxIndicator {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  .checkboxIcon {
    color: var(--secondary);
    width: rem(12);
    height: rem(12);
  }

  .checkboxContainer {
    display: inline-flex;
  }

  .checkboxBase {
    width: rem(16);
    height: rem(16);
    border: rem(1) solid var(--secondary);
    border-radius: 0;
    background-color: var(--a-white);
    flex: 0 0 auto;
  }

  .agreement {
    display: flex;
    align-items: flex-start;
    gap: rem(10);
    margin-bottom: rem(10);
    width: 100%;
    max-width: rem(270);
  }

  .agreementText {
    font: 400 10px/1 "Futura PT", sans-serif;
    color: var(--secondary);
    opacity: 0.8;
    margin: 0;
  }

  .agreementTextLink {
    border-bottom: rem(1) solid var(--secondary);
    cursor: pointer;
    text-decoration: none;
  }

  .subscribeBtn {
    width: rem(155);
    text-transform: uppercase;
    background: var(--primary);
    color: var(--a-white);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: rem(10);
    border-radius: 0;
    margin-bottom: rem(10);

    @media (max-width: #{size.$tablet}) {
      height: rem(30);
      font-size: rem(14);
      width: rem(130);
      padding: 0;
    }
  }
</style>
