<script setup lang="ts">
  import type { PackageResource } from "~/types/room";

  interface Props {
    services: PackageResource[];
    isServicePopupOpen: boolean;
  }

  defineProps<Props>();
  const emit = defineEmits<{
    "open-service-popup": [event: MouseEvent, service: PackageResource];
  }>();

  const openServicePopup = (event: MouseEvent, service: PackageResource) => {
    event.stopPropagation();
    emit("open-service-popup", event, service);
  };
</script>

<template>
  <section :class="$style.servicesWrapper">
    <h3 :class="$style.servicesTitle">Тарифы к номеру</h3>
    <ul :class="$style.servicesList">
      <li
        v-for="(service, serviceIndex) in services"
        :key="serviceIndex"
        :class="$style.serviceItem"
      >
        <span :class="$style.serviceText">{{ service.title }}</span>

        <button
          :class="$style.serviceButton"
          data-popup-button
          @click="openServicePopup($event, service)"
        >
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            :class="$style.chevronIcon"
          />
        </button>
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
  .servicesWrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }

  .servicesTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .servicesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
  }

  .serviceItem {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: rem(290);
    min-height: rem(50);
    border-radius: rem(24);
    border: rem(1) solid var(--a-border-primary);
    cursor: pointer;

    &:hover {
      background-color: var(--a-blackBg);

      .serviceText {
        color: var(--a-text-white);
      }

      .serviceButton {
        border: rem(1) solid var(--a-border-white);
        .chevronIcon {
          color: var(--a-white);
        }
      }
    }
  }

  .serviceText {
    font-family: "Inter", sans-serif;
    font-size: rem(20);
    color: var(--a-text-dark);
  }

  .serviceButton {
    position: absolute;
    right: rem(12);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32);
    height: rem(32);
    min-width: auto;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
    z-index: 2;

    &:hover {
      background-color: var(--a-primaryBg);
      border: none;

      .chevronIcon {
        color: var(--a-white);
      }
    }
  }

  .chevronIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-black);
  }
</style>
