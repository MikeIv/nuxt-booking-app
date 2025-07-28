<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });

  const { useImages } = useImageLoader();
  const desktopImages = useImages("images/spa/bg-slider");
  const mobileImages = useImages("images/spa/bg-slider");
</script>

<template>
  <LayoutContentBlock
    :id="anchorId"
    title="СПА"
    :has-two-columns="true"
    :content-class="$style.content"
    :column-left="$style.introLeft"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <CoreBackgroundSlider
        :images="desktopImages"
        :mobile-images="mobileImages"
      />
    </template>
    <template #right-column>
      <div>
        <h3 :class="$style.subTitle">
          Многопрофильная клиника и премиальный фитнес-центр
        </h3>
      </div>
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

  .title {
    position: relative;
    display: flex;
    margin-bottom: clamp(2px, 1vw, 32px);
    padding: rem(16) clamp(16px, 3vw, 8px);
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 3vw, 20px);
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: rem(4);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: rem(180);
      height: rem(4);
      background: var(--primary);
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

  .introLeft {
    position: relative;
    height: rem(300);
  }

  .introRight {
    padding: 0 rem(24) rem(16) rem(24);
  }

  .infoTitle {
    padding-top: clamp(10px, 4.5vw, 90px);
    font-family: "Playfair Display", serif;
    font-size: clamp(30px, 4vw, 60px);
    color: var(--secondary);
  }

  .subTitle {
    margin-bottom: rem(20);
    font-family: "Playfair Display", serif;
    font-size: clamp(24px, 4vw, 50px);
    color: var(--secondary);
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 4vw, 35px);
    color: var(--secondary);
  }
</style>
