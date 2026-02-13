<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  interface Props {
    id: number;
    title: string;
    price: number;
    packageCode?: string;
    photos?: string[];
    /** Индекс номера для мультибронирования (0 для одного номера) */
    roomIndex?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    packageCode: "",
    photos: () => [],
    roomIndex: 0,
  });
  const isPopupOpen = ref(false);
  const bookingStore = useBookingStore();

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  // Используем photos из props, если они переданы
  const serviceImages = computed(() => props.photos || []);
  const CAROUSEL_MIN_PHOTOS = 2;
  const CAROUSEL_TARGET_ITEMS = 3;
  const CAROUSEL_PLACEHOLDER_LABEL = "Service Photo";

  const { carouselImages } = useRoomCarousel(
    serviceImages,
    CAROUSEL_MIN_PHOTOS,
    CAROUSEL_TARGET_ITEMS,
    CAROUSEL_PLACEHOLDER_LABEL,
  );

  const isSelected = computed(() => {
    return bookingStore.isServiceSelected(props.id, props.roomIndex);
  });

  const handleAddService = () => {
    if (isSelected.value) {
      bookingStore.removeService(props.id, props.roomIndex);
    } else {
      bookingStore.addService(
        {
          id: props.id,
          title: props.title,
          price: props.price,
          packageCode: props.packageCode || undefined,
        },
        props.roomIndex,
      );
    }
  };
</script>

<template>
  <article :class="$style.card">
    <header :class="$style.carouselWrapper">
      <BookingCarousel
        :images="carouselImages"
        :alt-prefix="'Фото услуги'"
        :alt-text="title"
        height="326px"
      />
    </header>

    <div :class="$style.cardDetails">
      <div :class="$style.wrapperInfoBlock">
        <div :class="$style.serviceInfo">
          <h2 :class="$style.title">{{ title }}</h2>

          <BookingInfoButton
            icon-name="i-heroicons-chevron-down-20-solid"
            aria-label="Подробнее об услуге"
            :data-popup-button="true"
            @click="openPopup"
          />
        </div>

        <dl :class="$style.description">
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-persons" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">За всех гостей однократно</dd>
          </div>
        </dl>

        <div :class="$style.priceBlock">
          <data
            :class="$style.price"
            :value="price"
            itemprop="price"
          >
            От {{ price }} руб.
          </data>
        </div>

        <div :class="$style.periodBlock">
          <dl :class="$style.description">
            <div :class="$style.item">
              <dd :class="$style.itemTitle">За весь период проживания</dd>
            </div>
          </dl>
        </div>
      </div>

      <footer :class="$style.footer">
        <Button
          unstyled
          class="btn__bs"
          :class="[
            $style.addServiceButton,
            isSelected ? $style.addServiceButtonSelected : undefined,
          ]"
          @click="handleAddService"
        >
          <span>Добавить услугу</span>
        </Button>
      </footer>
    </div>

    <BookingServicePopup
      :title="title"
      :price="price"
      :images="serviceImages"
      :is-open="isPopupOpen"
      @close="closePopup"
    />
  </article>
</template>

<style module lang="scss">
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: rem(18) rem(14);
    box-shadow: 0 0 rem(10) rgba(0, 0, 0, 0.1);
    border-radius: var(--a-borderR--card);
    overflow: hidden;
  }

  .carouselWrapper {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: rem(20);
    min-height: rem(326);
    justify-content: center;
    align-items: flex-start;

    :global(.p-carousel) {
      width: 100%;
    }
  }

  .cardDetails {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .wrapperInfoBlock {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: rem(16);
    padding: 0 rem(16);
  }

  .serviceInfo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(12);
  }

  .title {
    display: inline-flex;
    flex-shrink: 1;
    font-family: "Lora", serif;
    font-size: rem(22);
    font-weight: bold;
    color: var(--a-text-dark);
    margin: 0;
  }


  .description {
    display: flex;
    flex-wrap: wrap;
    gap: rem(16);
    margin: 0;
    padding: 0;
  }

  .item {
    display: flex;
    gap: rem(8);
    align-items: center;
    margin-bottom: rem(8);
  }

  .itemTerm {
    display: flex;
    align-items: center;
    margin: 0;
  }

  .icon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
  }

  .itemTitle {
    font-family: "Inter", sans-serif;
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
    margin: 0;
  }

  .priceBlock {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(12);
  }

  .price {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .periodBlock {
    margin-bottom: rem(12);
  }

  .footer {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .addServiceButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: rem(274);
    height: fit-content;
    margin: 0 auto;
    padding: rem(8) rem(16);
    border: none;
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .addServiceButtonSelected {
    background-color: var(--a-primaryBg);

    &:hover:not(:disabled) {
      background-color: var(--a-primaryBg);
    }
  }
</style>

