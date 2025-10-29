<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <LayoutContentBlock
    :id="anchorId"
    title="Проживание"
    :has-two-columns="true"
    :content-class="$style.content"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <img
        src="/images/main-accommodaton.png"
        srcset="
          /images/main-accommodaton.png 1x,
          /images/main-accommodaton.png 2x
        "
        alt="гостиница"
        :class="$style.image"
      >
    </template>
    <template #right-column>
      <h2 :class="$style.infoTitle">Отель класса люкс</h2>
      <div>
        <h3 :class="$style.subTitle">156 номеров</h3>
        <p :class="$style.text">
          от 41 кв.м., в том числе номера с уникальной купольной архитектурой
          <br >и аттиковыми окнами
        </p>
      </div>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    flex-direction: column-reverse;

    @media (min-width: #{size.$tabletMax}) {
      flex-direction: row;
    }
  }

  .title {
    position: relative;
    display: flex;
    margin-bottom: clamp(2px, 1vw, 32px);
    padding: rem(16) clamp(16px, 3vw, 8px);
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 3vw, 20px);
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: rem(4);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: rem(180);
      height: rem(4);
      background: var(--primary);
    }
  }

  .image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(100%, 3vw, 50%);
    height: auto;
    object-fit: contain;
  }

  .introRight {
    align-items: stretch;
    height: 100%;
    padding: 0 rem(16) rem(16) rem(24);
  }

  .infoTitle {
    padding-top: clamp(10px, 4.5vw, 90px);
    font-family: "Playfair Display", serif;
    font-size: clamp(30px, 4vw, 60px);
    color: var(--secondary);
  }

  .subTitle {
    margin-bottom: rem(20);
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 4vw, 50px);
    color: var(--secondary);
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 4vw, 35px);
    color: var(--secondary);
  }
</style>
