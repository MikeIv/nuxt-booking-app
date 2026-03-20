<script setup lang="ts">
  type Props = {
    hasManagementActions: boolean;
    canEditDates: boolean;
    canEditRoom: boolean;
    canEditPackages: boolean;
    canEditContacts: boolean;
  };

  defineProps<Props>();

  const emit = defineEmits<{
    "change-dates": [];
    "change-room": [];
    "change-services": [];
    "change-contacts": [];
  }>();
</script>

<template>
  <div v-if="hasManagementActions" :class="$style.section">
    <h3 :class="$style.sectionTitle">Управление бронированием</h3>
    <p :class="$style.managementText">
      Если это не противоречит условиям Вашего тарифа, Вы можете:
    </p>
    <div :class="$style.managementButtons">
      <Button
        v-if="canEditDates"
        label="Изменить даты"
        class="btn__bs dark"
        unstyled
        @click="emit('change-dates')"
      />
      <Button
        v-if="canEditRoom"
        label="Изменить номер"
        class="btn__bs dark"
        unstyled
        @click="emit('change-room')"
      />
      <Button
        v-if="canEditPackages"
        label="Изменить услуги"
        class="btn__bs dark"
        unstyled
        @click="emit('change-services')"
      />
      <Button
        v-if="canEditContacts"
        label="Изменить контакты"
        class="btn__bs dark"
        unstyled
        @click="emit('change-contacts')"
      />
    </div>
  </div>
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
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      grid-template-columns: repeat(2, 1fr);
      gap: rem(16);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: repeat(4, 1fr);
    }

    :global(.btn__bs) {
      white-space: nowrap;
      min-width: 0;
    }
  }
</style>
