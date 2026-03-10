<template>
  <aside :class="$style.qr" aria-label="QR-код для перехода на сайт">
    <div :class="$style.qrImg">
      <img
        src="/images/footer/qr.svg"
        srcset="/images/footer/qr.svg 1x, /images/footer/qr.svg 2x"
        alt="QR-код для перехода на сайт"
        :class="$style.qrImgItem"
      >
    </div>
    <div :class="$style.qrText">
      QR-код
      <br >
      для перехода
      <br >
      на сайт
    </div>
  </aside>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .qr {
    display: flex;
    align-items: flex-end;
  }

  .qrImgItem {
    width: rem(92);
    height: rem(92);

    @media (max-width: #{size.$tablet}) {
      width: rem(55);
      height: rem(55);
    }

    @media (max-width: rem(415)) {
      width: rem(70);
      height: rem(70);
    }
  }

  .qrText {
    padding-left: rem(20);
    font: 400 10px/13px "Futura PT", sans-serif;
    letter-spacing: 0;
    opacity: 0.7;
  }
</style>
