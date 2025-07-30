<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });

  // const items = [
  //   "/images/constraction/slider/1.jpg",
  //   "/images/constraction/slider/2.jpg",
  //   "/images/constraction/slider/3.jpg",
  //   "/images/constraction/slider/4.jpg",
  // ];

  const items = ref([
    {
      image: "/images/constraction/slider/1.jpg",
      caption: "июнь / 2021",
    },
    {
      image: "/images/constraction/slider/2.jpg",
      caption: "март / 2021",
    },
    {
      image: "/images/constraction/slider/3.jpg",
      caption: "август / 2020",
    },
    {
      image: "/images/constraction/slider/4.jpg",
      caption: "июль / 2020",
    },
  ]);

  // const { useImages } = useImageLoader();
  // const desktopImages = useImages("images/entertaiment/bg-slider");
  // const mobileImages = useImages("images/entertaiment/bg-slider");
</script>

<template>
  <LayoutContentBlock
    :id="anchorId"
    title="Этапы строительства"
    :has-two-columns="false"
    :content-class="$style.content"
    :column-left="$style.introLeft"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <div>
        <p :class="$style.text">галлерея</p>
      </div>
      <div :class="$style.imageBlock">
        <div class="max-w-[1200px] mx-auto">
          <UCarousel
            v-slot="{ item }"
            loop
            wheel-gestures
            :items="items"
            :ui="{
              item: 'basis-1/2 sm:basis-1/3 md:basis-1/4 pb-6',
              container: 'gap-2',
            }"
          >
            <div class="relative h-[400px]">
              <img
                :src="item.image"
                class="rounded-lg object-cover w-full h-full"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-white bg-opacity-50 text-black p-2 text-center"
              >
                {{ item.caption }}
              </div>
            </div>
          </UCarousel>
        </div>

        <!--        <template>-->
        <!--          <UCarousel-->
        <!--            v-slot="{ item }"-->
        <!--            :items="items"-->
        <!--            :ui="{ item: 'basis-1/3' }"-->
        <!--          >-->
        <!--            <img :src="item" width="234" height="234" class="rounded-lg" />-->
        <!--          </UCarousel>-->
        <!--        </template>-->
      </div>
    </template>
    <template #right-column />
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
    padding: 0 rem(24) rem(16) rem(24);
  }

  .imageBlock {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: rem(400);
    margin: 0 auto;
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 4vw, 35px);
    color: var(--secondary);
  }

  .carousel {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    margin-inline-start: -1rem;
  }
</style>
