<script setup lang="ts">
interface Props {
  bookingNumber?: string | number | null;
  pdfUrl?: string;
  hasPdf?: boolean;
}

withDefaults(defineProps<Props>(), {
  bookingNumber: null,
  pdfUrl: undefined,
  hasPdf: false,
});

const emit = defineEmits<{
  download: [];
  print: [];
}>();

const handleDownload = () => {
  emit("download");
};

const handlePrint = () => {
  emit("print");
};
</script>

<template>
  <section :class="$style.section">
    <h2 :class="$style.sectionTitle">Номер Вашего бронирования:</h2>
    <div :class="$style.bookingInfo">
      <div :class="$style.bookingLeft">
        <p v-if="bookingNumber" :class="$style.bookingNumber">
          № {{ bookingNumber }}
        </p>
        <nav :class="$style.actionButtons" aria-label="Действия с бронированием">
          <Button
            v-if="hasPdf"
            class="btn__bs danger"
            unstyled
            @click="handleDownload"
          >
            Скачать подтверждение
          </Button>
          <Button
            class="btn__bs dark"
            unstyled
            @click="handlePrint"
          >
            Распечатать
          </Button>
        </nav>
      </div>
      <figure :class="$style.qrCode" aria-label="QR-код бронирования">
        <!-- TODO: Заменить заглушку на реальный QR-код с данными бронирования -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="white"/>
          <rect x="10" y="10" width="100" height="100" fill="black"/>
        </svg>
      </figure>
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

  .sectionTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(26);
    }
  }

  .bookingInfo {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    @media (min-width: #{size.$tablet}) {
      gap: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: rem(32);
    }
  }

  .bookingLeft {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    @media (min-width: #{size.$tablet}) {
      gap: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 1;
    }
  }

  .bookingNumber {
    font-family: "Lora", serif;
    font-size: rem(20);
    font-weight: 500;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(22);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .actionButtons {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      gap: rem(16);
    }
  }

  .qrCode {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    @media (min-width: #{size.$desktopMin}) {
      justify-content: flex-end;
    }

    svg {
      border: rem(1) solid var(--a-black);
      width: rem(100);
      height: rem(100);

      @media (min-width: #{size.$tablet}) {
        width: rem(120);
        height: rem(120);
      }

      @media (min-width: #{size.$desktopMin}) {
        width: rem(140);
        height: rem(140);
      }
    }
  }
</style>

