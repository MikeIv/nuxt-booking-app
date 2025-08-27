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
          <input :class="$style.inputEmail" placeholder="E-MAIL" />
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
              <UIcon name="i-telegram" :class="$style.telegramIcon" />
              <span :class="$style.socialMediaText"> Russia_Hotel </span>
            </a>
          </div>
          <div :class="$style.socialMediaItem">
            <a
              :class="$style.socialMediaItemLink"
              href="https://vk.com/"
              target="_blank"
            >
              <UIcon name="i-vk" :class="$style.vkIcon" />
              <span :class="$style.socialMediaText"> Russia_Hotel </span>
            </a>
          </div>
        </div>
        <div :class="$style.qr">
          <div :class="$style.qrImg">qr</div>
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
        :class="$style.image"
      />
    </template>
  </LayoutContentBlock>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    flex-direction: column-reverse;
    @media (min-width: #{size.$tabletMax}) {
      flex-direction: row;

      .footerInfo {
        padding: 90px 0 50px;
      }
    }
  }

  .agreement {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;

    .agreementText {
      font-weight: 600;
      font-size: 11px;
      margin-left: 0.5rem;

      .agreementTextLink {
        border-bottom: 1px solid #686062;
        cursor: pointer;
      }
    }
  }

  .image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(100%, 3vw, 50%);
    height: auto;
    object-fit: contain;
    border: 1px solid #c4c4c4;
    max-width: 800px;
  }

  .inputEmail {
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: clamp(14px, 3vw, 16px);
    width: 70%;
    border-bottom: 1px solid #686062;

    &::placeholder {
      color: var(--secondary);
    }
    &:hover {
      box-shadow: none;
      outline: none;
    }
  }

  .introRight {
    align-items: stretch;
    height: 100%;
    padding: 0 rem(16) rem(16) rem(24);
  }

  .subscribeBtn {
    width: 140px;
    padding-left: 1rem;
    border-radius: 0%;
    background-color: var(--primary);
    text-align: center;
    font-weight: 600;
    font-size: clamp(14px, 3vw, 16px);
    cursor: pointer;
  }

  .text {
    font-weight: 600;
    font-size: clamp(14px, 3vw, 16px);
  }

  .telegramIcon {
    margin-right: 21px;
    width: 28px;
    height: 28px;
    color: rgb(104, 96, 98);
  }

  .vkIcon {
    margin-right: 15px;
    width: 34px;
    height: 34px;
    color: rgb(104, 96, 98);
  }

  .socialMediaText {
    font-weight: 500;
    font-size: 13px;
    margin-top: 0.5rem;
  }

  .footerInfo {
    display: grid;
    gap: 8px;
    padding: 0 rem(16) rem(16) rem(16);
    font-family: "Futura PT", sans-serif;
    color: var(--secondary);

    // Мобильная версия (до 670px)
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto auto;

    // Расположение элементов для мобильной версии
    .mainLinks1 {
      grid-column: 1;
      grid-row: 1;
      padding: 10px;
    }

    .mainLinks2 {
      grid-column: 2;
      grid-row: 1;
      padding: 10px;
    }

    .cellForm {
      grid-column: 1 / span 2;
      grid-row: 2;
      width: 90%;
      padding: 10px;
      display: flex;
      flex-direction: column;
    }

    .adress {
      grid-column: 1 / span 2;
      grid-row: 3;
      padding: 10px;
      font-weight: 600;
      font-size: clamp(14px, 3vw, 16px);
      display: grid;
      align-self: end;
      grid-template-columns: 1fr;
      gap: 5px;

      .adressBox {
        display: flex;
        flex-direction: column;
      }
    }

    .socialMedia {
      grid-column: 1;
      grid-row: 4;
      padding: 10px;
      display: flex;
      flex-direction: column;

      .socialMediaItemLink {
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
      }
    }

    .qr {
      grid-column: 2;
      grid-row: 4;
      padding: 10px;
      display: flex;
      flex-direction: row;

      .qrText {
        padding-left: 20px;
        align-self: flex-end;
        line-height: 1.1rem;
        font-size: 13px;
      }
    }

    .copyright {
      grid-column: 1 / span 2;
      grid-row: 5;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;

      .copyrightBtn {
        border-radius: 0;
        max-width: 200px;
        background-color: var(--primary);
        font-weight: 600;
        font-size: 14px;
        padding: 5px 15px;
        cursor: pointer;
      }

      .copyrightText {
        font-size: 13px;
      }
    }

    // Десктопная версия (от 670px)
    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: 1fr 1.5fr 1fr;
      grid-template-rows: auto auto auto;

      // Переопределяем расположение для десктопной версии
      .mainLinks1 {
        grid-column: 1;
        grid-row: 1;
        padding-bottom: 0;
      }

      .mainLinks2 {
        padding-top: 0;
        grid-column: 1;
        grid-row: 2;
      }

      .cellForm {
        grid-column: 2;
        grid-row: 1 / span 2;

        .inputEmail {
          width: 100%;
        }
      }

      .adress {
        grid-column: 1 / span 2;
        grid-row: 3;
        font-size: 14px;

        .adressBox {
          display: flex;
          flex-direction: row;
        }

        .adressBox a {
          margin-right: 10px;
        }
      }

      .socialMedia {
        grid-column: 3;
        grid-row: 1;
      }

      .qr {
        grid-column: 3;
        grid-row: 2;
      }

      .copyright {
        grid-column: 3;
        grid-row: 3;

        .copyrightBtn {
          font-size: 11px;
        }
      }
    }

    // Десктопная версия (от 768px)
    @media (min-width: #{size.$tablet}) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto auto;

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
        grid-column: 2;
        grid-row: 1 / span 2;

        .inputEmail {
          margin-top: 30px;
        }
      }

      .adress {
        grid-column: 1;
        grid-row: 3;
        font-size: 14px;
        max-width: 210px;

        .adressBox {
          display: flex;
          flex-direction: column;
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

    @media (min-width: #{size.$desktopMin}) {
      gap: 16px;
    }

    @media (min-width: #{size.$desktop}) {
      gap: 30px;
    }

    @media (min-width: #{size.$desktopMax}) {
      gap: 40px;
    }
  }

  .navList {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .navItem {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .navLink {
    text-decoration: none;
    font-size: clamp(14px, 3vw, 16px);
    transition: color 0.3s ease;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }

    &.router-link-active {
      font-weight: bold;
    }
  }
</style>
