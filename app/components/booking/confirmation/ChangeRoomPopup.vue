<script setup lang="ts">
  import Popup from "~/components/ui/Popup.vue";

  type Props = {
    isOpen: boolean;
    isChangingRoom: boolean;
    changeRoomSuccess: string | null;
    changeRoomError: string | null;
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
    max-width="480px"
    title="Изменить номер"
    @close="emit('close')"
  >
    <template #content>
      <div :class="$style.content">
        <p :class="$style.text">Вы подтверждаете смену номера?</p>

        <div :class="$style.actions">
          <Button
            label="Изменить номер"
            class="btn__bs dark"
            unstyled
            :disabled="isChangingRoom"
            @click="emit('confirm')"
          />
          <Button
            label="Отмена"
            class="btn__bs danger"
            unstyled
            :disabled="isChangingRoom"
            @click="emit('close')"
          />
        </div>

        <p v-if="isChangingRoom" :class="$style.status">Изменяем номер...</p>
        <p v-else-if="changeRoomSuccess" :class="$style.success">
          {{ changeRoomSuccess }}
        </p>
        <p v-else-if="changeRoomError" :class="$style.error">
          {{ changeRoomError }}
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
    padding: 0 rem(24);
  }

  .text {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(20);
    line-height: 1.5;
    color: var(--a-text-dark);
    text-align: center;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: rem(12);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
      justify-content: center;
      gap: rem(16);
    }

    :global(.btn__bs) {
      width: 100%;

      @media (min-width: #{size.$tablet}) {
        width: auto;
        min-width: rem(180);
      }
    }
  }

  .status {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-text-light);
    text-align: center;
  }

  .success {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--success);
    text-align: center;
    word-break: break-word;
  }

  .error {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    line-height: 1.4;
    color: var(--a-btnAccentBg);
    text-align: center;
    word-break: break-word;
  }
</style>
