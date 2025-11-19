<script setup lang="ts">
  import UIPopup from "~/components/ui/Popup.vue";
  import RoomPopupCarousel from "~/components/booking/RoomPopupCarousel.vue";
  import type { PackageResource } from "~/types/room";

  interface Props {
    // Новый формат (для ServiceCard)
    title?: string;
    price?: number;
    images?: string[];
    // Старый формат (для других компонентов)
    service?: PackageResource;
    isOpen: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  const handleSelectService = () => {
    // Логика выбора услуги
    console.log("Выбрать услугу:", serviceTitle.value);
    closePopup();
  };

  // Вычисляемые значения для совместимости с обоими форматами
  const serviceTitle = computed(() => {
    return props.title || props.service?.title || "";
  });

  const servicePrice = computed(() => {
    if (props.price !== undefined) {
      return props.price;
    }
    if (props.service?.price) {
      return parseInt(props.service.price) || 0;
    }
    return 0;
  });

  const serviceImages = computed(() => {
    return props.images || props.service?.photos || [];
  });

  const serviceDescriptionText = computed(() => {
    // Если есть описание из service, используем его
    if (props.service?.description) {
      return props.service.description;
    }
    // Иначе используем произвольное описание (5 строк)
    return `Наша услуга "${serviceTitle.value}" создана для вашего максимального комфорта и удобства. Мы предлагаем высококачественный сервис, который поможет сделать ваше пребывание незабываемым. Наша команда профессионалов готова обеспечить вам первоклассное обслуживание с вниманием к каждой детали. Мы гарантируем индивидуальный подход к каждому гостю и создание особой атмосферы гостеприимства. Выберите эту услугу, чтобы сделать ваше пребывание еще более приятным и комфортным.`;
  });

  // Константы для карусели
  const CAROUSEL_MIN_PHOTOS = 2;
  const CAROUSEL_TARGET_ITEMS = 3;
  const CAROUSEL_PLACEHOLDER_LABEL = "Service Photo";

  type CarouselItem = string | { placeholder: true; label?: string };

  const createPlaceholder = (): CarouselItem => ({
    placeholder: true,
    label: CAROUSEL_PLACEHOLDER_LABEL,
  });

  const carouselImages = computed<CarouselItem[]>(() => {
    const photos = serviceImages.value || [];
    const photosCount = photos.length;

    if (photosCount >= CAROUSEL_MIN_PHOTOS) {
      return photos;
    }

    const placeholdersNeeded = CAROUSEL_TARGET_ITEMS - photosCount;
    const placeholders = Array.from(
      { length: placeholdersNeeded },
      createPlaceholder,
    );

    return [...photos, ...placeholders];
  });
</script>

<template>
  <UIPopup
    :is-open="isOpen"
    :title="serviceTitle"
    max-width="1400px"
    @close="closePopup"
  >
    <template #content>
      <div :class="$style.serviceContent">
        <!-- Заголовок услуги -->
        <h4 :class="$style.serviceTitle">{{ serviceTitle }}</h4>

        <!-- Слайдер -->
        <div id="gallery" :class="$style.sliderWrapper">
          <RoomPopupCarousel
            :images="carouselImages"
            :alt-prefix="'Фото услуги'"
            :alt-text="serviceTitle"
          />
        </div>

        <!-- Блок из двух колонок -->
        <div :class="$style.infoBlock">
          <!-- Левая колонка - описание -->
          <div :class="$style.descriptionColumn">
            <p
              :class="$style.description"
              v-html="serviceDescriptionText"
            />
          </div>

          <!-- Правая колонка - информация из карточки -->
          <div :class="$style.infoColumn">
            <dl :class="$style.infoList">
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
                :value="servicePrice"
                itemprop="price"
              >
                От {{ servicePrice }} руб.
              </data>
            </div>

            <div :class="$style.periodBlock">
              <dl :class="$style.infoList">
                <div :class="$style.item">
                  <dd :class="$style.itemTitle">За весь период проживания</dd>
                </div>
              </dl>
            </div>

            <div :class="$style.footer">
              <Button
                unstyled
                class="btn__bs"
                :class="$style.selectButton"
                @click="handleSelectService"
              >
                <span>Выбрать</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UIPopup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .serviceContent {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    overflow: hidden;
    padding: 0 rem(20);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(34);
    }
  }

  .serviceTitle {
    margin: 0 0 rem(20) 0;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 700;
    line-height: 1.2;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
    }
  }

  .sliderWrapper {
    padding: 0;
    width: 100%;
    overflow: hidden;
    margin-bottom: rem(24);
  }

  .infoBlock {
    display: flex;
    flex-direction: column;
    gap: rem(24);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      gap: rem(40);
    }
  }

  .descriptionColumn {
    flex: 1;
    min-width: 0;

    @media (min-width: #{size.$desktopMin}) {
      flex: 2;
    }
  }

  .description {
    margin: 0;
    padding: 0;
    font-family: "Lora", serif;
    font-size: rem(16);
    line-height: 1.6;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(18);
      line-height: 1.8;
    }
  }

  .infoColumn {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding: 0 rem(20) rem(20) rem(20);
    background: var(--a-gray-50);

    @media (min-width: #{size.$desktopMin}) {
      flex: 0 0 rem(320);
      min-width: rem(280);
    }
  }

  .infoList {
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
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-light);
    margin: 0;

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(15);
    }
  }

  .priceBlock {
    display: flex;
    flex-direction: column;
  }

  .price {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(28);
    }
  }

  .periodBlock {
    margin-bottom: rem(12);
  }

  .footer {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: rem(12);
  }

  .selectButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: fit-content;
    padding: rem(12) rem(20);
    border: none;
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-blackBg);
    color: var(--a-white);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(18);
      padding: rem(14) rem(24);
    }

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
</style>

