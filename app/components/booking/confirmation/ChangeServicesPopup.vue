<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";
  import type { PackageResource } from "~/types/room";

  type Props = {
    isOpen: boolean;
    isLoadingPackages: boolean;
    isChangingServices: boolean;
    availablePackages: PackageResource[];
    selectedPackageCodes: string[];
    changeServicesSuccess: string | null;
    changeServicesError: string | null;
  };

  defineProps<Props>();

  const emit = defineEmits<{
    close: [];
    confirm: [];
    "toggle-package": [code: string];
  }>();

  function formatPrice(price: string): string {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(num);
  }
</script>

<template>
  <Popup
    :is-open="isOpen"
    max-width="640px"
    title="Изменить услуги"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.content">
        <p :class="$style.text">
          Выберите дополнительные услуги для вашего бронирования.
        </p>

        <div v-if="isLoadingPackages" :class="$style.loading">
          Загружаем доступные услуги...
        </div>

        <div v-else-if="availablePackages.length > 0" :class="$style.packagesList">
          <button
            v-for="pkg in availablePackages"
            :key="pkg.package_code"
            type="button"
            :class="[
              $style.packageItem,
              selectedPackageCodes.includes(pkg.package_code)
                ? $style.packageItemSelected
                : undefined,
            ]"
            @click="emit('toggle-package', pkg.package_code)"
          >
            <span :class="$style.packageCheckbox">
              <span
                v-if="selectedPackageCodes.includes(pkg.package_code)"
                :class="$style.packageCheckboxInner"
              />
            </span>
            <span :class="$style.packageInfo">
              <span :class="$style.packageTitle">{{ pkg.title }}</span>
              <span v-if="pkg.description" :class="$style.packageDescription">
                {{ pkg.description }}
              </span>
            </span>
            <span :class="$style.packagePrice">
              {{ formatPrice(pkg.price) }}
              <span v-if="pkg.calculation_rate_title" :class="$style.packageRate">
                {{ pkg.calculation_rate_title }}
              </span>
            </span>
          </button>
        </div>

        <p v-else-if="!isLoadingPackages && !changeServicesError" :class="$style.emptyText">
          Для данного бронирования дополнительные услуги недоступны.
        </p>

        <div :class="$style.actions">
          <Button
            label="Сохранить"
            class="btn__bs dark"
            unstyled
            :disabled="isChangingServices || isLoadingPackages"
            @click="emit('confirm')"
          />
          <Button
            label="Отмена"
            class="btn__bs danger"
            unstyled
            :disabled="isChangingServices"
            @click="emit('close')"
          />
        </div>

        <p v-if="isChangingServices" :class="$style.status">
          Обновляем услуги...
        </p>
        <p v-else-if="changeServicesSuccess" :class="$style.success">
          {{ changeServicesSuccess }}
        </p>
        <p v-else-if="changeServicesError" :class="$style.error">
          {{ changeServicesError }}
        </p>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    padding: 0 rem(24);
  }

  .text {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.5;
    color: var(--a-text-dark);
    text-align: center;
  }

  .loading,
  .emptyText {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.5;
    color: var(--a-text-light);
    text-align: center;
    padding: rem(8) 0;
  }

  .packagesList {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .packageItem {
    display: flex;
    align-items: flex-start;
    gap: rem(12);
    padding: rem(12) rem(14);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease;
    width: 100%;

    &:hover {
      border-color: var(--a-border-primary);
    }
  }

  .packageItemSelected {
    border-color: var(--a-border-primary);
    background: rgba(191, 157, 124, 0.06);
  }

  .packageCheckbox {
    flex-shrink: 0;
    width: rem(18);
    height: rem(18);
    margin-top: rem(2);
    border: rem(1.5) solid var(--a-border-light);
    border-radius: rem(3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s ease;

    .packageItemSelected & {
      border-color: var(--a-border-primary);
      background: var(--a-border-primary);
    }
  }

  .packageCheckboxInner {
    width: rem(10);
    height: rem(6);
    border-left: rem(2) solid var(--a-whiteBg);
    border-bottom: rem(2) solid var(--a-whiteBg);
    transform: rotate(-45deg) translateY(-1px);
  }

  .packageInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }

  .packageTitle {
    font-family: var(--a-font-body);
    font-size: rem(15);
    font-weight: 500;
    line-height: 1.4;
    color: var(--a-text-dark);
  }

  .packageDescription {
    font-family: var(--a-font-body);
    font-size: rem(13);
    line-height: 1.4;
    color: var(--a-text-light);
  }

  .packagePrice {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: rem(2);
    font-family: var(--a-font-body);
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .packageRate {
    font-size: rem(11);
    font-weight: 400;
    color: var(--a-text-light);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: center;
      gap: rem(16);
    }

    :global(.btn__bs) {
      width: 100%;

      @media (min-width: #{size.$tablet}) {
        width: auto;
        min-width: rem(180);
      }
    }
  }

  .status {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-light);
    text-align: center;
  }

  .success {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--success);
    text-align: center;
    word-break: break-word;
  }

  .error {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-btnAccentBg);
    text-align: center;
    word-break: break-word;
  }
</style>
