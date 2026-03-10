<template>
  <footer :class="$style.copyright">
    <UButton
      icon="i-pdf"
      size="xl"
      label="ПРАВИЛА ПАРКОВКИ"
      :class="$style.copyrightBtn"
    />
    <a
      href="#"
      target="_blank"
      :class="$style.privacyLink"
      rel="noopener noreferrer"
    >
      Политика конфиденциальности
    </a>
    <p :class="$style.copyrightText">© 2022 ООО «МФК», Москва</p>
  </footer>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .copyright {
    display: flex;
    flex-direction: column;
    color: var(--secondary);
  }

  .copyrightBtn {
    border-radius: 0;
    width: max-content;
    background-color: var(--primary);
    color: var(--a-white);
    font-weight: 600;
    font-size: rem(11);
    padding: rem(5) rem(15);
    letter-spacing: 0;
    margin-bottom: rem(12);
    cursor: pointer;
  }

  .copyrightText {
    font: 400 10px/1 "Futura PT", sans-serif;
    letter-spacing: 0;
    color: var(--secondary);
    white-space: nowrap;
    opacity: 1;
    text-decoration: none;
  }

  .privacyLink {
    font: 400 10px/1 "Futura PT", sans-serif;
    letter-spacing: 0;
    color: var(--secondary);
    white-space: nowrap;
    opacity: 1;
    text-decoration: none;
    display: block;
    padding-bottom: rem(12);
  }

  @media (max-width: #{size.$tablet}) {
    .copyrightBtn {
      height: rem(30);
      padding: rem(5) rem(15);
    }
  }
</style>
