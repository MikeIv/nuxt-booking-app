<script setup lang="ts">
  interface FooterProps {
    anchorId?: string;
  }

  withDefaults(defineProps<FooterProps>(), {
    anchorId: "",
  });
</script>

<template>
  <LayoutContentBlock
    :has-two-columns="true"
    :no-bottom-margin="true"
    :layout-class="$style.layout"
    :content-class="$style.content"
    :column-left="$style.columnLeft"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <section :class="$style.footerInfo">
        <LayoutFooterNav :class="$style.menu" />
        <LayoutFooterSubscribe :class="$style.cellForm" />
        <LayoutFooterContacts :class="$style.adress" />
        <LayoutFooterSocial :class="$style.socialMedia" />
        <LayoutFooterQR :class="$style.qr" />
        <LayoutFooterCopyright :class="$style.copyright" />
      </section>
    </template>
    <template #right-column>
      <img
        src="/images/footer/map.svg"
        srcset="/images/footer/map.svg 1x, /images/footer/map.svg 2x"
        alt="карта"
        :class="$style.imagePic"
      >
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .layout {
    padding: 0;
    margin-top: rem(90);
    background-color: var(--ui-color-primary-50);

    @media (max-width: #{size.$desktopMin}) {
      margin-top: rem(80);
    }

    @media (max-width: #{size.$tabletMin}) {
      margin-top: rem(60);
    }
  }

  .content {
    max-width: rem(1540);
    margin-left: auto;
    margin-right: auto;
    padding: 0 rem(15);
    display: grid;
    grid-template-columns: 1fr;
    row-gap: rem(30);

    @media (max-width: #{size.$desktop}) {
      padding: 0 rem(30);
    }

    @media (max-width: #{size.$tabletMax}) {
      padding: 0 rem(15);
    }

    @media (min-width: #{size.$tabletMax}) {
      grid-template-columns: 42% auto;
      column-gap: 9%;
      row-gap: 0;
      align-items: start;
    }

    @media (min-width: #{size.$tabletMax}) and (max-width: #{size.$desktopMedium}) {
      grid-template-columns: 40% auto;
      column-gap: 2%;
    }
  }

  .columnLeft {
    align-items: stretch;
    padding: rem(110) 0 rem(50);

    @media (max-width: #{size.$desktop}) {
      padding: rem(90) 0 rem(50);
    }

    @media (max-width: #{size.$desktopMin}) {
      padding: rem(60) 0 rem(50);
    }

    @media (max-width: #{size.$tablet}) {
      padding: rem(30) 0;
    }
  }

  .introRight {
    align-items: stretch;
    height: 100%;
  }

  .imagePic {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: auto;
    object-fit: contain;
    border: rem(1) solid #c4c4c4;

    @media (min-width: #{size.$tabletMax}) {
      width: 100%;
    }
  }

  .footerInfo {
    width: 100%;
    display: grid;
    padding: rem(30) 0;
    color: var(--secondary);
    font: 600 14px/2.1 "Futura PT", sans-serif;
    letter-spacing: 1px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "footer-menu footer-subscribe"
      "footer-address footer-social"
      "footer-copyright footer-qr";
    column-gap: rem(50);
    row-gap: rem(30);
  }

  .menu {
    grid-area: footer-menu;
  }

  .cellForm {
    grid-area: footer-subscribe;
  }

  .adress {
    grid-area: footer-address;
  }

  .socialMedia {
    grid-area: footer-social;
  }

  .qr {
    grid-area: footer-qr;
  }

  .copyright {
    grid-area: footer-copyright;
  }

  @media (max-width: #{size.$tablet}) {
    .footerInfo {
      grid-template-areas:
        "footer-menu footer-subscribe footer-social"
        "footer-menu footer-subscribe footer-qr"
        "footer-address footer-address footer-copyright";
      grid-template-columns: auto 38% auto;
      column-gap: rem(50);
      row-gap: rem(30);
    }

    .adress {
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr;
      align-content: start;
      align-self: end;

      p {
        grid-column: 1 / 3;
      }
    }

    .copyright {
      align-self: end;
    }
  }

  @media (max-width: #{size.$tabletMin}) {
    .footerInfo {
      grid-template-areas:
        "footer-menu footer-menu"
        "footer-subscribe footer-subscribe"
        "footer-address footer-address"
        "footer-social footer-qr"
        "footer-copyright footer-copyright";
      grid-template-columns: 1fr 1fr;
      column-gap: rem(30);
      row-gap: rem(25);
    }

    .cellForm {
      max-width: none;
      width: 100%;
    }

    .adress {
      grid-template-columns: 1fr;

      p {
        grid-column: 1 / 2;
      }
    }
  }
</style>