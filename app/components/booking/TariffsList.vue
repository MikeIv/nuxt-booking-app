<script setup lang="ts">
  // @ts-nocheck - Vue автоматически преобразует kebab-case в camelCase в шаблонах
  import type { RoomTariff } from "~/types/room";

  interface Props {
    tariffs: RoomTariff[];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "book-tariff"): void;
  }>();

  const selectedFilter = ref<string | null>(null);

  /**
   * Определяет тип тарифа на основе его свойств
   * Предоплатный тариф обычно имеет price_for_register
   */
  const getTariffType = (tariff: RoomTariff): "basic" | "prepaid" => {
    // Если есть price_for_register, считаем тариф предоплатным
    // В противном случае - базовым
    return tariff.price_for_register !== undefined ? "prepaid" : "basic";
  };

  /**
   * Отфильтрованные тарифы на основе выбранного фильтра
   */
  const filteredTariffs = computed(() => {
    if (selectedFilter.value === null) {
      return props.tariffs;
    }
    return props.tariffs.filter(
      (tariff) => getTariffType(tariff) === selectedFilter.value,
    );
  });

  const handleBook = () => {
    emit("book-tariff");
  };

  const handleFilterClick = (filterType: string | null) => {
    selectedFilter.value = filterType;
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
    <div
      v-if="filteredTariffs.length === 0"
      :class="$style.emptyState"
      role="status"
      aria-live="polite"
    >
      <p>Тарифы не найдены</p>
    </div>
    <ul
      v-else
      :class="$style.tariffsList"
      role="list"
      aria-label="Список тарифов"
    >
      <li
        v-for="tariff in filteredTariffs"
        :key="tariff.rate_plan_code"
        :class="$style.tariffItem"
        role="listitem"
      >
        <article class="section-shadow">
          <div :class="$style.otherTariffInfo">
            <h3 :class="$style.tariffName">{{ tariff.title }}</h3>
            <BookingInfoButtonWithPopover
              :popover-id="tariff.rate_plan_code"
              size="medium"
              :aria-label="`Информация о тарифе ${tariff.title}`"
            >
              <BookingTariffPopoverContent />
            </BookingInfoButtonWithPopover>
          </div>

          <ul :class="$style.tariffData">
            <li :class="$style.dataItem">
              <UIcon
                name="i-fork-knife"
                :class="[
                  $style.dataIcon,
                  { [$style.dataIconPenalty]: !tariff.has_food },
                ]"
              />
              <span :class="$style.dataText">
                {{
                  tariff.has_food ? "Питание включено" : "Питание не включено"
                }}
              </span>
            </li>
            <li :class="$style.dataItem">
              <UIcon
                name="i-cancellation"
                :class="[
                  $style.dataIcon,
                  { [$style.dataIconPenalty]: !tariff.cancellation_free },
                ]"
              />
              <span :class="$style.dataText">
                {{
                  tariff.cancellation_free
                    ? "Отмена без штрафа"
                    : "Отмена со штрафом"
                }}
              </span>
              <BookingInfoButtonWithPopover
                :popover-id="`cancellation-${tariff.rate_plan_code}`"
                size="small"
                :aria-label="`Информация об отмене для тарифа ${tariff.title}`"
              >
                <BookingCancellationPopoverContent
                  :title="tariff.cancellation_popover?.title"
                  :description="tariff.cancellation_popover?.description"
                />
              </BookingInfoButtonWithPopover>
            </li>
            <li :class="$style.dataItem">
              <UIcon name="i-payment" :class="$style.dataIcon" />
              <span :class="$style.dataText">
                Оплата банковской картой, по QR-коду (СБП), гарантия банковской
                картой
              </span>
            </li>
          </ul>

          <section
            v-if="tariff.packages?.length"
            :class="$style.tariffPackages"
          >
            <h4 :class="$style.packagesTitle">Включенные пакеты:</h4>
            <ul :class="$style.packagesList">
              <li
                v-for="(pkg, pkgIndex) in tariff.packages"
                :key="`${tariff.rate_plan_code}-pkg-${pkgIndex}`"
                :class="$style.packageItem"
              >
                {{ pkg.title }}
              </li>
            </ul>
          </section>

          <footer :class="$style.tariffBookingSection">
            <data
              :class="$style.tariffPrice"
              :value="tariff.price"
              itemprop="price"
            >
              {{ tariff.price }} руб.
            </data>
            <span :class="$style.tariffPriceLabel"
              >Средняя стоимость за 1 ночь
            </span>
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
      border-color: var(--a-text-primary);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-primaryBg);
      outline-offset: rem(2);
    }

    &.filterItemActive {
      background: var(--a-primaryBg);
      color: var(--a-text-white);
      border-color: var(--a-primaryBg);

      &:hover {
        color: var(--a-text-white);
        border-color: var(--a-primaryBg);
      }

      &:focus-visible {
        outline-color: var(--a-text-white);
      }
    }
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    list-style: none;
    padding: 0;
    margin: 0 0 rem(24) 0;
  }

  .tariffItem {
    list-style: none;
  }

  .emptyState {
    padding: rem(40) rem(20);
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    color: var(--a-text-light);
  }

  .otherTariffInfo {
    display: flex;
    align-items: center;
    gap: rem(24);
    margin-bottom: rem(20);
  }

  .tariffName {
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;
  }

  .tariffData {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    margin-top: rem(16);
    margin-bottom: rem(24);
    list-style: none;
    padding: 0;
  }

  .dataItem {
    display: flex;
    align-items: center;
    gap: rem(16);
  }

  .dataIcon {
    width: rem(20);
    height: rem(20);
    flex-shrink: 0;
    color: #178b08;
  }

  .dataIconPenalty {
    color: #9ca3af;
  }

  .dataText {
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);
  }

  .tariffBookingSection {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tariffPriceLabel {
    margin-left: auto;
    margin-bottom: rem(20);
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .tariffPrice {
    margin-left: auto;
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
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-btnAccentBg);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-primaryBg);
      outline-offset: rem(2);
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

  :global {
    .p-popover:before {
      left: 20px !important;
    }

    .tariffPopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }
  }
</style>
