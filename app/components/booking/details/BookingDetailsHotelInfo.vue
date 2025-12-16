<script setup lang="ts">
interface Props {
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: "/images/room/room-01.jpg",
});
</script>

<template>
  <section :class="$style.section">
    <div :class="$style.hotelInfo">
      <div :class="$style.hotelImage">
        <img 
          :src="props.imageUrl" 
          :alt="props.name"
          :class="$style.hotelImg"
        />
      </div>
      <div :class="$style.hotelDetails">
        <h3 :class="$style.hotelName">{{ props.name }}</h3>
        <address :class="$style.hotelAddress">{{ props.address }}</address>
        <a :href="`tel:${props.phone}`" :class="$style.hotelPhone">
          {{ props.phone }}
        </a>
        <a :href="`mailto:${props.email}`" :class="$style.hotelEmail">
          {{ props.email }}
        </a>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(24) 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(20);
      padding: rem(28) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(24);
      padding: rem(32) 0;
    }
  }

  .hotelInfo {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    @media (min-width: #{size.$tablet}) {
      gap: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      gap: rem(32);
    }
  }

  .hotelImage {
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      flex: 0 0 45%;
    }
  }

  .hotelImg {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: var(--a-borderR--card);
    display: block;

    @media (min-width: #{size.$tablet}) {
      max-height: rem(300);
    }

    @media (min-width: #{size.$desktopMin}) {
      max-height: rem(250);
    }
  }

  .hotelDetails {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$desktopMin}) {
      flex: 1;
      justify-content: center;
    }
  }

  .hotelName {
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(22);
    }
  }

  .hotelAddress {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    font-style: normal;
    color: var(--a-text-dark);
    line-height: 1.5;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .hotelPhone,
  .hotelEmail {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
    text-decoration: none;
    line-height: 1.5;
    transition: color 0.2s ease;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }

    &:hover {
      color: var(--a-primary);
    }
  }
</style>

