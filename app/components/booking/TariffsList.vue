<script setup lang="ts">
  import type { RoomTariff } from "~/types/room";

  interface Props {
    tariffs: RoomTariff[];
  }

  defineProps<Props>();
  const emit = defineEmits<{
    "book-tariff": [];
  }>();

  const handleBook = () => {
    emit("book-tariff");
  };
</script>

<template>
  <section :class="$style.tariffsSection">
    <div :class="$style.tariffsList">
      <div
        v-for="(tariff, tariffIndex) in tariffs"
        :key="tariffIndex"
        :class="$style.tariffItem"
        class="section-shadow"
      >
        <h4 :class="$style.tariffName">{{ tariff.title }}</h4>

        <div v-if="tariff.packages?.length" :class="$style.tariffPackages">
          <h6 :class="$style.packagesTitle">Включенные пакеты:</h6>
          <div :class="$style.packagesList">
            <span
              v-for="(pkg, pkgIndex) in tariff.packages"
              :key="pkgIndex"
              :class="$style.packageItem"
            >
              {{ pkg.title }}
            </span>
          </div>
        </div>

        <div :class="$style.tariffBookingSection">
          <span :class="$style.tariffPriceLabel"> Стоимость за 1 ночь </span>
          <div :class="$style.tariffPrice">{{ tariff.price }} руб.</div>
          <Button
            label="Забронировать"
            :class="$style.tariffBookingButton"
            unstyled
            @click="handleBook"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  .tariffsSection {
    border-top: rem(1) solid var(--a-border-light);
    padding-top: rem(24);
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .tariffItem {
    margin-bottom: rem(40);
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
