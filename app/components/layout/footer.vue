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
              <NuxtLink to="/" :class="$style.navLink">Главная</NuxtLink>
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/about.php"
                :class="$style.navLink"
                target="_blank"
                >О проекте</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/hotel.php"
                :class="$style.navLink"
                target="_blank"
                >Отель</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/service.php"
                :class="$style.navLink"
                target="_blank"
                >Сервисы</a
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
                >Галерея</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/construction-progress.php"
                :class="$style.navLink"
                target="_blank"
                >Этапы строительства</a
              >
            </li>
            <li :class="$style.navItem">
              <a
                href="http://varvarkan.grandfs.ru/contacts.php"
                :class="$style.navLink"
                target="_blank"
                >Контакты</a
              >
            </li>
          </ul>
        </nav>
        <div :class="$style.cell3">3 (span 2 columns)</div>
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

  .introRight {
    align-items: stretch;
    height: 100%;
    padding: 0 rem(16) rem(16) rem(24);
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 4vw, 35px);
    color: var(--secondary);
  }

  .footerInfo {
    display: grid;
    gap: 8px;

    // Мобильная версия (до 670px)
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto auto;

    // Расположение элементов для мобильной версии
    .cell1 {
      grid-column: 1;
      grid-row: 1;
      background-color: rgba(255, 200, 200, 0.5);
      padding: 10px;
    }

    .cell2 {
      grid-column: 2;
      grid-row: 1;
      background-color: rgba(200, 255, 200, 0.5);
      padding: 10px;
    }

    .cell3 {
      grid-column: 1 / span 2;
      grid-row: 2;
      background-color: rgba(200, 200, 255, 0.5);
      padding: 10px;
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

      .cell3 {
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
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .navLink {
    color: var(--primary);
    text-decoration: none;
    font-size: 16px;
    transition: color 0.3s ease;

    &:hover {
      color: var(--accent);
      text-decoration: underline;
    }

    &.router-link-active {
      font-weight: bold;
      color: var(--accent);
    }
  }
</style>
