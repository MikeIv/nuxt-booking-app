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
    max-width="560px"
    :show-close-button="false"
    :close-on-click-outside="false"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.cancelPopupContent">
        <p :class="$style.cancelPopupText">
          Все данные Вашего бронирования будут удалены
        </p>
        <div :class="$style.cancelPopupActions">
          <Button
            label="Отменить бронирование"
            class="btn__bs danger"
            unstyled
            :class="$style.whiteBtnText"
            :disabled="isCancellingBooking"
            @click="emit('confirm')"
          />
          <Button
            label="Вернуться"
            class="btn__bs dark"
            unstyled
            :class="$style.whiteBtnText"
            :disabled="isCancellingBooking"
            @click="emit('close')"
          />
        </div>
        <p v-if="cancelBookingError" :class="$style.cancelPopupError">
          {{ cancelBookingError }}
        </p>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cancelPopupContent {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    padding: 0 rem(24);
  }

  .cancelPopupText {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(18);
    line-height: 1.5;
    color: var(--a-btnAccentBg);
    text-align: center;
  }

  .cancelPopupActions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: space-between;
      gap: rem(16);
    }

    :global(.btn__bs) {
      padding-left: rem(20);
      padding-right: rem(20);
      width: 100%;

      @media (min-width: #{size.$tablet}) {
        width: auto;
      }
    }
  }

  .whiteBtnText {
    color: var(--a-text-white);
  }

  .cancelPopupError {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-btnAccentBg);
    text-align: center;
    word-break: break-word;
  }
</style>
