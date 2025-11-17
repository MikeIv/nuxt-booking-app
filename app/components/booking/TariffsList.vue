<script setup lang="ts">
  import type { RoomTariff } from "~/types/room";

  interface Props {
    tariffs: RoomTariff[];
  }

  defineProps<Props>();
  const emit = defineEmits<{
    "book-tariff": [];
  }>();

  const selectedFilter = ref<string | null>(null);

  const handleBook = () => {
    emit("book-tariff");
  };

  const handleFilterClick = (filterType: string | null) => {
    if (filterType === null) {
      // Сброс фильтра - показываем все тарифы
      selectedFilter.value = null;
    } else {
      selectedFilter.value = filterType;
    }
    // Интеграция с API будет позже
  };
</script>

<template>
  <section :class="$style.tariffsSection">
    <h2 :class="$style.tariffsTitle">Тарифы к номеру</h2>
    <nav
      :class="$style.tarifsFiltersBlock"
      role="group"
      aria-label="Фильтры тарифов"
    >
      <button
        :class="[
          $style.filterItem,
          { [$style.filterItemActive]: selectedFilter === null },
        ]"
        :aria-pressed="selectedFilter === null"
        @click="handleFilterClick(null)"
      >
        Все тарифы
      </button>
      <button
        :class="[
          $style.filterItem,
          { [$style.filterItemActive]: selectedFilter === 'basic' },
        ]"
        :aria-pressed="selectedFilter === 'basic'"
        @click="handleFilterClick('basic')"
      >
        Базовый
      </button>
      <button
        :class="[
          $style.filterItem,
          { [$style.filterItemActive]: selectedFilter === 'prepaid' },
        ]"
        :aria-pressed="selectedFilter === 'prepaid'"
        @click="handleFilterClick('prepaid')"
      >
        Предоплатный
      </button>
    </nav>
    <ul :class="$style.tariffsList">
      <li
        v-for="(tariff, tariffIndex) in tariffs"
        :key="tariffIndex"
        :class="$style.tariffItem"
      >
        <article class="section-shadow">
          <h3 :class="$style.tariffName">{{ tariff.title }}</h3>

          <section
            v-if="tariff.packages?.length"
            :class="$style.tariffPackages"
          >
            <h4 :class="$style.packagesTitle">Включенные пакеты:</h4>
            <ul :class="$style.packagesList">
              <li
                v-for="(pkg, pkgIndex) in tariff.packages"
                :key="pkgIndex"
                :class="$style.packageItem"
              >
                {{ pkg.title }}
              </li>
            </ul>
          </section>

          <footer :class="$style.tariffBookingSection">
            <span :class="$style.tariffPriceLabel"> Стоимость за 1 ночь </span>
            <data
              :class="$style.tariffPrice"
              :value="tariff.price"
              itemprop="price"
            >
              {{ tariff.price }} руб.
            </data>
            <Button
              label="Забронировать"
              :class="$style.tariffBookingButton"
              unstyled
              @click="handleBook"
            />
          </footer>
        </article>
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .tariffsSection {
    padding-top: rem(24);
  }

  .tariffsTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .tarifsFiltersBlock {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    padding: 0;
    margin: 0 0 rem(24) 0;
    width: 100%;

    @media (min-width: #{size.$tabletMin}) {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }

  .filterItem {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: rem(50);
    padding: rem(2) rem(14);
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--dialog);
    background: var(--a-whiteBg);
    transition: all 0.2s ease;
    cursor: pointer;

    @media (min-width: #{size.$tabletMin}) {
      width: rem(300);
      flex: 0 1 auto;
    }

    &:hover {
      color: var(--a-text-primary);
    }

    &.filterItemActive {
      background: var(--a-primaryBg);
      color: var(--a-text-white);
      border-color: var(--a-primaryBg);

      &:hover {
        color: var(--a-text-white);
      }
    }
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tariffItem {
    margin-bottom: rem(40);
    list-style: none;
  }

  .tariffName {
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
    flex: 1;
  }

  .tariffBookingSection {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tariffPriceLabel {
    margin-left: auto;
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .tariffPrice {
    margin-left: auto;
    margin-bottom: rem(10);
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 700;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .tariffBookingButton {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    margin-left: auto;
    width: rem(290);
    height: rem(44);
    font-size: rem(18);
    color: var(--a-text-white);
    background-color: var(--a-blackBg);
    border-radius: var(--a-borderR--btn);
    cursor: pointer;

    &:hover {
      background-color: var(--a-btnAccentBg);
    }
  }

  .packagesTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(8);
  }

  .packagesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .packageItem {
    padding: rem(4) rem(12);
    background: var(--a-white);
    border: rem(1) solid var(--a-border-light);
    border-radius: rem(6);
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    color: var(--a-text-dark);
  }
</style>
