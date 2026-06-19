<script setup lang="ts">
import Popup from "~/components/ui/Popup.vue";

type Props = {
  isOpen: boolean;
  isChangingServices: boolean;
  changeServicesSuccess: string | null;
  changeServicesError: string | null;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const isServicesChangeSuccessful = computed(() =>
  Boolean(props.changeServicesSuccess),
);
</script>

<template>
  <Popup
    :is-open="isOpen"
    max-width="480px"
    title="Изменить услуги"
    @close="emit('close')"
  >
    <template #content>
      <div
        :class="[
          $style.content,
          isServicesChangeSuccessful ? $style.contentSuccess : undefined,
        ]"
      >
        <template v-if="isServicesChangeSuccessful">
          <h2 :class="$style.title">
            {{ changeServicesSuccess }}
          </h2>
          <div :class="$style.actions">
            <Button
              label="Выход"
              class="btn__bs dark"
              unstyled
              @click="emit('close')"
            />
          </div>
        </template>

        <template v-else>
          <p :class="$style.text">Вы подтверждаете изменение услуг?</p>

          <div :class="$style.actions">
            <Button
              label="Изменить услуги"
              class="btn__bs dark"
              unstyled
              :disabled="isChangingServices"
              @click="emit('confirm')"
            />
            <Button
              label="Отмена"
              class="btn__bs danger"
              unstyled
              :disabled="isChangingServices"
              @click="emit('close')"
            />
          </div>

          <p v-if="isChangingServices" :class="$style.status">
            Обновляем услуги...
          </p>
          <p v-else-if="changeServicesError" :class="$style.error">
            {{ changeServicesError }}
          </p>
        </template>
      </div>
    </template>
  </Popup>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.content {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  padding: 0 rem(24);
}

.contentSuccess {
  gap: rem(24);
}

.title {
  margin: 0;
  font-family: var(--a-font-heading);
  font-size: rem(24);
  font-weight: 700;
  line-height: 1.4;
  color: var(--a-text-dark);
  text-align: center;
  word-break: break-word;
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
