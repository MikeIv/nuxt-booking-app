<script setup lang="ts">
  const date = ref<string>();
  const popover = ref(false);
  const items = ref(["Backlog", "Todo", "In Progress", "Done"]);
  const value = ref("Backlog");
</script>

<template>
  <section :class="$style.wrapper">
    <div :class="$style.form">
      <UPopover
        v-model:open="popover"
        :dismissible="false"
        :ui="{
          content: 'w-[var(--calendar-width)] p-4',
          width: 'w-[var(--calendar-width)]',
        }"
      >
        <UInput
          v-model="date"
          placeholder="Выберите дату"
          icon="uil:calendar-alt"
          color="primary"
          readonly
          :class="$style.input"
          @click="popover = true"
        >
          <template v-if="date" #trailing>
            <UButton
              color="primary"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click.stop="date = ''"
            />
          </template>
        </UInput>

        <template #content>
          <UCalendar
            v-model="date"
            size="xl"
            :ui="{
              wrapper: 'w-[var(--calendar-width)]',
              base: 'w-full',
            }"
            @update:model-value="popover = false"
          />
        </template>
      </UPopover>

      <UInputMenu v-model="value" :items="items" />
      <UButton color="bgAccent" class="text-white px-4 py-2" size="sm">
        Поиск
      </UButton>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  :root {
    --calendar-width: 400px; /* Ширина календаря */
  }

  .wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
  }

  .form {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    max-width: size.$desktop;
    min-width: rem(400);
    background-color: var(--primary);
    min-height: rem(50);
    padding: 0 1rem;
  }

  .input {
    width: 200px;

    /* Если нужно изменить цвет при фокусе */
    &:focus {
      background-color: white;
    }
  }
</style>
