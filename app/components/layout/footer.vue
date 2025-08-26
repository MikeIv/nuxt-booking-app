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
        <!-- Для демонстрации сетки добавлены дополнительные элементы -->
        <nav :class="$style.cell1">
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
        <nav :class="$style.cell2">
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
          <!-- <hr :class="$style.line"/> -->
        </div>
        <div :class="$style.cell4">4 (span 2 columns)</div>
        <div :class="$style.cell5">5</div>
        <div :class="$style.cell6">6</div>
        <div :class="$style.cell7">
          7 (span 2 columns)
          <p>
            lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
          </p>
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

  .inputEmail {
    margin-top: 0.75rem;
    font-family: "Futura PT", sans-serif;
    font-weight: 500;
    font-size: clamp(14px, 3vw, 16px);
    color: var(--secondary);
    width: 100%;
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

  .line {
    color: var(--secondary);
    max-width: 55%;
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-weight: 600;
    font-size: clamp(14px, 3vw, 16px);
    color: var(--secondary);
  }

  .footerInfo {
    display: grid;
    gap: 8px;
    padding: 0 rem(16) rem(16) rem(16);

    // Мобильная версия (до 670px)
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto auto;

    // Расположение элементов для мобильной версии
    .cell1 {
      grid-column: 1;
      grid-row: 1;
      padding: 10px;
      background-color: rgba(255, 200, 200, 0.5);
    }

    .cell2 {
      grid-column: 2;
      grid-row: 1;
      background-color: rgba(200, 255, 200, 0.5);
      padding: 10px;
    }

    .cellForm {
      grid-column: 1 / span 2;
      grid-row: 2;
      width: 90%;
      // background-color: rgba(200, 200, 255, 0.5);
      background-color: rgb(249, 245, 242);
      padding: 10px;
      display: flex;
      flex-direction: column;
    }

    .cell4 {
      grid-column: 1 / span 2;
      grid-row: 3;
      background-color: rgba(255, 255, 200, 0.5);
      padding: 10px;
    }

    .cell5 {
      grid-column: 1;
      grid-row: 4;
      background-color: rgba(255, 200, 255, 0.5);
      padding: 10px;
    }

    .cell6 {
      grid-column: 2;
      grid-row: 4;
      background-color: rgba(200, 255, 255, 0.5);
      padding: 10px;
    }

    .cell7 {
      grid-column: 1 / span 2;
      grid-row: 5;
      background-color: rgba(220, 220, 220, 0.5);
      padding: 10px;
    }

    // Десктопная версия (от 670px)
    @media (min-width: 670px) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;

      // Переопределяем расположение для десктопной версии
      .cell1 {
        grid-column: 1;
        grid-row: 1;
      }

      .cell2 {
        grid-column: 2;
        grid-row: 1;
      }

      .cellForm {
        grid-column: 1;
        grid-row: 2;
      }

      .cell4 {
        grid-column: 2;
        grid-row: 2;
      }

      .cell5 {
        grid-column: 1;
        grid-row: 3;
      }

      .cell6 {
        grid-column: 2;
        grid-row: 3;
      }

      .cell7 {
        grid-column: 1;
        grid-row: 4;
      }
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
    font-family: "Futura PT", sans-serif;
    font-weight: 600;
    color: var(--secondary);

    &:hover {
      text-decoration: underline;
    }

    &.router-link-active {
      font-weight: bold;
    }
  }
</style>
