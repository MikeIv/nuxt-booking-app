<script setup lang="ts">
  defineProps<{
    canEditDates: boolean;
    canEditRoom: boolean;
    canEditPackages: boolean;
    canEditContacts: boolean;
  }>();

  const emit = defineEmits<{
    "change-dates": [];
    "change-room": [];
    "change-services": [];
    "change-contacts": [];
  }>();
</script>

<template>
  <section :class="$style.section">
    <h2 :class="$style.sectionTitle">Управление бронированием</h2>
    <p :class="$style.managementText">
      Если это не противоречит условиям Вашего тарифа, Вы можете:
    </p>
    <div :class="$style.managementButtons">
      <Button
        v-if="canEditDates"
        class="btn__bs dark"
        unstyled
        @click="emit('change-dates')"
      >
        Изменить даты
      </Button>
      <Button
        v-if="canEditRoom"
        class="btn__bs dark"
        unstyled
        @click="emit('change-room')"
      >
        Изменить номер
      </Button>
      <Button
        v-if="canEditPackages"
        class="btn__bs dark"
        unstyled
        @click="emit('change-services')"
      >
        Изменить услуги
      </Button>
      <Button
        v-if="canEditContacts"
        class="btn__bs dark"
        unstyled
        @click="emit('change-contacts')"
      >
        Изменить контакты
      </Button>
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

  .managementText {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
    line-height: 1.5;
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .managementButtons {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      gap: rem(16);

      :global(.btn__bs) {
        flex: 1;
        min-width: 0;
      }
    }
  }
</style>
