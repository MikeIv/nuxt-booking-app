<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const route = useRoute();
  const router = useRouter();
  const bookingStore = useBookingStore();

  const bookingNumber = computed(() => {
    const val = route.query.bookingNumber;
    return typeof val === "string" && val.trim() !== "" ? val.trim() : null;
  });

  const confirmationEmail = computed(() => {
    const val = route.query.email;
    return typeof val === "string" && val.trim() !== "" ? val.trim() : null;
  });

  const handleNewBooking = () => {
    bookingStore.forceReset();
    router.push("/");
  };
</script>

<template>
  <main :class="$style.container">
    <h1 :class="$style.header" data-breadcrumb="Отмена бронирования">
      Ваше бронирование успешно отменено!
    </h1>

    <section :class="$style.contentBlock">
      <div :class="$style.mainContent">

        <div :class="$style.section">
          <p :class="$style.sectionLabel">Номер отмененного бронирования:</p>
          <p v-if="bookingNumber" :class="$style.bookingNumber">
            № {{ bookingNumber }}
          </p>
        </div>

        <div :class="$style.divider" />

        <div :class="$style.section">
          <p :class="$style.emailText">
            Подтверждение об отмене бронирования отправлено на указанную Вами
            электронную почту<template v-if="confirmationEmail">
              <br /><strong>{{ confirmationEmail }}</strong>
            </template>
          </p>
        </div>

        <div :class="$style.divider" />

        <div :class="$style.section">
          <p :class="$style.thanksText">
            Спасибо, что сообщили об отмене бронирования.<br />
            Ждем вас во время следующих поездок!
          </p>
        </div>

        <div :class="$style.divider" />

        <div :class="$style.section">
          <Button
            label="Новое бронирование"
            class="btn__bs danger"
            unstyled
            @click="handleNewBooking"
          />
        </div>

      </div>
    </section>
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: rem(24) rem(16);
    font-family: var(--a-font-heading);
    font-size: rem(28);
    font-weight: 600;
    line-height: 1.3;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(30);
      margin: rem(32) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
      margin: rem(40) 0;
    }
  }

  .contentBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(16);

    @media (min-width: #{size.$tablet}) {
      padding: rem(16) rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding: rem(20) rem(32);
    }

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .mainContent {
    display: flex;
    flex-direction: column;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(24) 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(16);
      padding: rem(28) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(20);
      padding: rem(32) 0;
    }

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
      margin-right: auto;
    }
  }

  .sectionLabel {
    font-family: var(--a-font-heading);
    font-size: rem(18);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(22);
    }
  }

  .bookingNumber {
    font-family: var(--a-font-heading);
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(22);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .emailText {
    font-family: var(--a-font-heading);
    font-size: rem(16);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.5;
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(20);
    }
  }

  .thanksText {
    font-family: var(--a-font-heading);
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.6;
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(18);
    }
  }

  .divider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-black);
  }
</style>
