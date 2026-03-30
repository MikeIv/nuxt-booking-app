<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";

  type Props = {
    isOpen: boolean;
    isCancellingBooking: boolean;
    cancelBookingError: string | null;
  };

  defineProps<Props>();

  const emit = defineEmits<{
    close: [];
    confirm: [];
  }>();
</script>

<template>
  <Popup
    :is-open="isOpen"
    max-width="600px"
    border-radius="var(--a-borderR--dialog)"
    :show-close-button="true"
    :close-on-click-outside="false"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.content">
        <h2 :class="$style.title">Отмена бронирования</h2>
        <p :class="$style.text">
          Вы уверены, что хотите отменить бронирование?
        </p>
        <div :class="$style.divider" />
        <div :class="$style.actions">
          <Button
            label="Нет"
            class="btn__bs dark"
            unstyled
            :disabled="isCancellingBooking"
            @click="emit('close')"
          />
          <Button
            label="Да, отменить"
            class="btn__bs dark"
            unstyled
            :disabled="isCancellingBooking"
            @click="emit('confirm')"
          />
        </div>
        <p v-if="cancelBookingError" :class="$style.error">
          {{ cancelBookingError }}
        </p>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    display: flex;
    flex-direction: column;
    gap: rem(24);
    padding: 0 rem(30) rem(10);
  }

  .title {
    margin: 0;
    font-family: var(--a-font-heading);
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
    text-align: center;
  }

  .text {
    margin: 0;
    font-family: var(--a-font-heading);
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-dark);
    text-align: center;
  }

  .divider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-dark);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      gap: rem(16);
    }

    :global(.btn__bs) {
      width: 100%;
    }
  }

  .error {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-error);
    text-align: center;
    word-break: break-word;
  }
</style>
