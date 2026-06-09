<script setup lang="ts">
  defineProps<{
    canCancelBooking: boolean;
  }>();

  const emit = defineEmits<{
    cancel: [];
    "new-booking": [];
    "back-to-cabinet": [];
  }>();
</script>

<template>
  <nav :class="$style.actionsWrapper" aria-label="Действия с бронированием">
    <section :class="$style.section">
      <div :class="$style.finalButtons" role="group" aria-label="Основные действия">
        <Button
          v-if="canCancelBooking"
          class="btn__bs danger"
          unstyled
          @click="emit('cancel')"
        >
          Отменить бронирование
        </Button>
        <Button
          class="btn__bs danger"
          unstyled
          @click="emit('new-booking')"
        >
          Новое бронирование
        </Button>
      </div>
    </section>

    <section :class="$style.section">
      <Button
        class="btn__bs dark"
        :class="$style.backButton"
        unstyled
        @click="emit('back-to-cabinet')"
      >
        Вернуться в кабинет
      </Button>
    </section>
  </nav>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .actionsWrapper {
    display: flex;
    flex-direction: column;
    padding-top: rem(24);

    @media (min-width: #{size.$tablet}) {
      padding-top: rem(28);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding-top: rem(32);
    }
  }

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

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
    }
  }

  .finalButtons {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: space-between;
      gap: rem(16);
    }
  }

  .backButton {
    width: 100%;
    max-width: rem(300);

    @media (min-width: #{size.$tablet}) {
      width: auto;
    }
  }
</style>
