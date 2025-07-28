<script setup lang="ts"></script>

<template>
  <LayoutContentBlock
    :has-two-columns="true"
    :layout-class="$style.intro"
    :column-left="$style.introLeft"
    :column-right="$style.introRight"
  >
    <template #left-column>
      <h2 :class="$style.title">Welcom</h2>
    </template>

    <template #right-column>
      <p :class="$style.text">
        Уединение и роскошь гостиницы de luxe класса и изящная архитектура
        современных апартаментов в самом сердце Москвы у исторической
        Китайгородской стены.
      </p>
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  .intro {
    display: flex;
    width: 100%;
    min-height: clamp(150px, 3vw, 220px);
    margin-top: rem(40);
    margin-bottom: rem(50);
    padding-top: clamp(30px, 3vw, 50px);
    background-image: url("/images/welcome.png");
    background-repeat: no-repeat;
    background-position: left top;
    background-size: contain;
  }
  .introLeft {
    width: 30%;
    height: 100%;
    padding-left: rem(40);
  }

  .introRight {
    width: 70%;
    height: 100%;
    padding-right: rem(40);
  }

  .title {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 3vw, 28px);
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
  }

  .text {
    padding: 0 clamp(16px, 3vw, 8px);
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 3vw, 35px);
    color: var(--secondary);
    line-height: 1.3;
  }
</style>
