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
    :has-two-columns="true"
    :content-class="$style.content"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <section :class="$style.footerInfo">
        <nav :class="$style.mainLinks1">
          <ul :class="$style.navList">
            <li :class="$style.navItem">
              <NuxtLink to="/" :class="$style.navLink">ГЛАВНАЯ</NuxtLink>
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/about.php"
                :class="$style.navLink"
                target="_blank"
                >О ПРОЕКТЕ</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/hotel.php"
                :class="$style.navLink"
                target="_blank"
                >ОТЕЛЬ</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/service.php"
                :class="$style.navLink"
                target="_blank"
                >СЕРВИСЫ</a
              >
            </li>
          </ul>
        </nav>
        <nav :class="$style.mainLinks2">
          <ul :class="$style.navList">
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/gallery.php"
                :class="$style.navLink"
                target="_blank"
                >ГАЛЕРЕЯ</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/construction-progress.php"
                :class="$style.navLink"
                target="_blank"
                >ЭТАПЫ СТРОИТЕЛЬСТВА</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/contacts.php"
                :class="$style.navLink"
                target="_blank"
                >КОНТАКТЫ</a
              >
            </li>
          </ul>
        </nav>
        <div :class="$style.cellForm">
          <p :class="$style.text">БУДЬ В КУРСЕ ПОСЛЕДНИХ НОВОСТЕЙ</p>
          <div :class="$style.email">
            <input :class="$style.emailInput" placeholder="E-MAIL" />
          </div>
          <div :class="$style.agreement">
            <UCheckbox size="lg" color="primary" />
            <p :class="$style.agreementText">
              Даю согласие на обработку
              <a href="#" :class="$style.agreementTextLink">
                персональных данных
              </a>
            </p>
          </div>
          <UButton label="ПОДПИСАТЬСЯ" :class="$style.subscribeBtn" />
        </div>
        <div :class="$style.adress">
          <p>109012, РОССИЯ, Г. МОСКВА УЛ. ВАРВАРКА, Д.14, СТР. 1, 2</p>
          <div :class="$style.adressBox">
            <a href="tel:+74952749999">+7 (495) 274-99-99</a>
            <a href="mailto:">mail@mail.ru</a>
          </div>
        </div>
        <div :class="$style.socialMedia">
          <div :class="$style.socialMediaItem">
            <a
              :class="$style.socialMediaItemLink"
              href="https://t.me/"
              target="_blank"
            >
              <div :class="$style.iconBox">
                <UIcon name="i-telegram" :class="$style.telegramIcon" />
              </div>
              <span :class="$style.socialMediaText"> Russia_Hotel </span>
            </a>
          </div>
          <div :class="$style.socialMediaItem">
            <a
              :class="$style.socialMediaItemLink"
              href="https://vk.com/"
              target="_blank"
            >
              <div :class="$style.iconBox">
                <UIcon name="i-vk" :class="$style.vkIcon" />
              </div>
              <span :class="$style.socialMediaText"> Russia_Hotel </span>
            </a>
          </div>
        </div>
        <div :class="$style.qr">
          <div :class="$style.qrImg">
            <img
              src="/images/footer/qr.svg"
              srcset="/images/footer/qr.svg 1x, /images/footer/qr.svg 2x"
              alt="карта"
              :class="$style.qrImgItem"
            />
          </div>
          <div :class="$style.qrText">
            QR-код
            <br />
            для перехода
            <br />
            на сайт
          </div>
        </div>
        <div :class="$style.copyright">
          <UButton
            icon="i-pdf"
            size="xl"
            label="ПРАВИЛА ПАРКОВКИ"
            :class="$style.copyrightBtn"
          />
          <a href="#" target="_blank" :class="$style.copyrightText"
            >Политика конфиденциальности</a
          >
          <p :class="$style.copyrightText">© 2022 ООО «МФК», Москва</p>
        </div>
      </section>
    </template>
    <template #right-column>
      <img
        src="/images/footer/map.svg"
        srcset="/images/footer/map.svg 1x, /images/footer/map.svg 2x"
        alt="карта"
        :class="$style.imagePic"
      />
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    max-width: rem(1540);
    margin: auto;
    flex-direction: column-reverse;
    @media (min-width: #{size.$tabletMax}) {
      flex-direction: row;
    }
  }

  .agreement {
    display: flex;
    flex-direction: row;
    margin-bottom: rem(10);
    width: rem(270);
    height: rem(17);

    .agreementText {
      font-weight: 600;
      font-size: rem(10);
      margin-left: 0.5rem;
      letter-spacing: rem(0.3);
      line-height: 1.5;
      opacity: 80%;

      .agreementTextLink {
        border-bottom: rem(1) solid #686062;
        cursor: pointer;
      }
    }
  }

  .imagePic {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(100%, 3vw, 50%);
    height: auto;
    object-fit: contain;
    border: rem(1) solid #c4c4c4;

    @media (min-width: #{size.$tabletMax}) {
      max-width: rem(755);
      min-width: rem(550);
      height: auto;
    }
  }

  .email {
    height: rem(40);
    max-width: rem(290);
  }

  .emailInput {
    height: rem(30);
    width: 100%;
    padding: rem(6) rem(12) rem(6) 0;
    border-bottom: rem(1) solid #686062;
    line-height: 1.5;

    &::placeholder {
      color: var(--secondary);
      opacity: 75%;
    }
    &:hover {
      box-shadow: none;
      outline: none;
    }
  }

  .introRight {
    align-items: stretch;
    height: 100%;
  }

  .subscribeBtn {
    width: rem(140);
    height: rem(30);
    padding-left: rem(17);
    padding-bottom: rem(7);
    margin-bottom: rem(10);
    border-radius: 0%;
    background-color: var(--primary);
    color: var(--a-white);
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }

  .text {
    width: rem(270);
    font-weight: 600;
    opacity: 75%;
    margin-bottom: rem(10);
  }

  .footerInfo {
    width: 100%;
    display: grid;
    gap: rem(25) rem(30);
    padding: rem(30) 0;
    font-size: rem(14);
    transition: color 0.4s ease;
    font-weight: 600;
    font-family: "Futura PT", sans-serif;
    line-height: 2.1;
    letter-spacing: rem(1);
    color: var(--secondary);

    // Мобильная версия (до 670px)
    grid-template-columns: 1fr 1.09fr;
    grid-template-rows: auto auto auto auto auto;

    // Расположение элементов для мобильной версии
    .mainLinks1 {
      grid-column: 1;
      grid-row: 1;
    }

    .mainLinks2 {
      grid-column: 2;
      grid-row: 1;
    }

    .cellForm {
      grid-column: 1 / span 2;
      grid-row: 2;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .adress {
      grid-column: 1 / span 2;
      grid-row: 3;
      font-weight: 600;
      font-size: 13px;
      display: grid;
      align-self: end;
      grid-template-columns: 1fr;
      opacity: 75%;
      line-height: 1.7;
      letter-spacing: rem(0);

      .adressBox {
        display: flex;
        flex-direction: column;
      }
    }

    .socialMedia {
      grid-column: 1;
      grid-row: 4;
      display: flex;
      flex-direction: column;
      width: rem(166);
      height: rem(92);

      .socialMediaItem {
        height: rem(34);
        margin-bottom: rem(10);
      }

      .socialMediaItemLink {
        display: flex;
        flex-direction: row;
        margin-bottom: rem(10);
      }

      .iconBox {
        width: rem(37);
        height: rem(37);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .telegramIcon {
        width: rem(30);
        height: rem(30);
        color: rgb(104, 96, 98);
      }

      .vkIcon {
        width: rem(37);
        height: rem(37);
        color: rgb(104, 96, 98);
      }

      .socialMediaText {
        padding-left: rem(15);
        font-size: rem(10);
        color: #686062;
        letter-spacing: 0;
        line-height: 4;
        opacity: 70%;
      }
    }

    .qr {
      grid-column: 2;
      grid-row: 4;
      display: flex;
      flex-direction: row;
      margin-left: rem(20);

      .qrImgItem {
        width: rem(92);
        height: rem(92);
      }

      .qrText {
        padding-left: rem(20);
        align-self: flex-end;
        line-height: 1.1rem;
        font-size: rem(10);
        line-height: rem(13);
        letter-spacing: 0;
        opacity: 70%;
      }
    }

    .copyright {
      grid-column: 1 / span 2;
      grid-row: 5;
      display: flex;
      flex-direction: column;

      .copyrightBtn {
        border-radius: 0;
        width: rem(160);
        background-color: var(--primary);
        color: var(--a-white);
        font-weight: 600;
        font-size: rem(11);
        padding: rem(5) rem(10);
        letter-spacing: 0;
        margin-bottom: rem(16);
        cursor: pointer;
      }

      .copyrightText {
        font-size: rem(10);
        letter-spacing: 0;
        opacity: 75%;
      }
    }

    // Десктопная версия (от 670px)
    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: 1fr 1.4fr 0.8fr;
      grid-template-rows: auto auto auto;
      gap: 0;

      // Переопределяем расположение для десктопной версии
      .mainLinks1 {
        grid-column: 1;
        grid-row: 1;
      }

      .mainLinks2 {
        grid-column: 1;
        grid-row: 2;
      }

      .cellForm {
        width: 250px;
        grid-column: 2;
        grid-row: 1 / span 2;

        .text,
        .email,
        .emailInput {
          width: 100%;
        }

        .agreement {
          width: 90%;
          margin-bottom: rem(25);
        }
      }

      .adress {
        grid-column: 1 / span 2;
        grid-row: 3;
        font-size: rem(14);

        .adressBox {
          display: flex;
          flex-direction: row;
        }

        .adressBox a {
          margin-right: rem(10);
        }
      }

      .socialMedia {
        grid-column: 3;
        grid-row: 1;
      }

      .qr {
        grid-column: 3;
        grid-row: 2;
        margin-left: 0;
        margin-bottom: rem(30);
      }

      .copyright {
        grid-column: 3;
        grid-row: 3;

        .copyrightBtn {
          font-size: rem(11);
        }
      }
    }

    // Десктопная версия (от 768px)
    @media (min-width: #{size.$tablet}) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto auto;
      padding: rem(60) 0 rem(50);

      .mainLinks1 {
        grid-column: 1;
        grid-row: 1;
      }

      .mainLinks2 {
        padding-top: 0;
        grid-column: 1;
        grid-row: 2;
      }

      .cellForm {
        width: 300px;
        grid-column: 2;
        grid-row: 1 / span 2;

        .emailInput {
          height: rem(45);
        }

        .agreement {
          margin-top: rem(15);
          margin-bottom: rem(10);
        }

        .subscribeBtn {
          width: rem(155);
          height: rem(36);
          padding-left: rem(17);
          padding-bottom: rem(6);
          font-size: 16px;
        }
      }

      .adress {
        grid-column: 1;
        grid-row: 3;
        font-size: rem(14);
        max-width: rem(210);
        margin-top: rem(30);
        margin-bottom: rem(30);
        line-height: 1.4;
        font-size: rem(13);
        width: rem(170);

        .adressBox {
          display: flex;
          flex-direction: column;
          line-height: 1.9;
        }
      }

      .socialMedia {
        grid-column: 2;
        grid-row: 3;
      }

      .qr {
        grid-column: 2;
        grid-row: 4;
      }

      .copyright {
        grid-column: 1;
        grid-row: 4;
      }
    }

    @media (min-width: #{size.$tabletMax}) {
      grid-template-columns: 0.7fr 0.7fr;
      gap: 0;
      max-height: rem(515);

      .cellForm {
        width: rem(206);

        .email {
          width: 100%;
        }

        .copyright,
        .qr {
          margin-bottom: 0;
        }

        .emailInput {
          width: 90%;
          margin-bottom: rem(25);
          margin-top: rem(8);
        }

        .agreement {
          margin-bottom: rem(25);
          margin-top: rem(20);
        }
      }

      .adress {
        margin-top: rem(15);
        margin-bottom: rem(15);
      }
    }

    @media (min-width: #{size.$desktopMin}) {
      max-height: rem(760);
      .cellForm {
        width: rem(300);

        .email {
          width: 100%;
        }
      }

      .adress,
      .socialMedia {
        margin-top: rem(100);
        margin-bottom: rem(100);
      }
    }

    @media (min-width: #{size.$desktop}) {
    }

    @media (min-width: #{size.$desktopMax}) {
    }
  }

  .navList {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .navItem {
    margin-bottom: rem(2);
    line-height: rem(30);
  }

  .navLink {
    text-decoration: none;
    opacity: 75%;

    &:hover {
      text-decoration: underline;
    }

    &.router-link-active {
      font-weight: bold;
    }
  }
</style>
