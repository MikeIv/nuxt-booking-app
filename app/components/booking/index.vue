<script setup lang="ts">
  const date = ref<string>();
  const guestsPopover = ref(false);
  const guests = ref({
    rooms: 1,
    adults: 2,
    children: 0,
  });
  const promoCode = ref("");
</script>

<template>
  <section :class="$style.wrapper">
    <div :class="$style.form">
      <CoreDatePicker v-model="date" />

      <UPopover v-model:open="guestsPopover">
        <div :class="$style.inputWrapper">
          <input
            readonly
            :class="$style.customInput"
            placeholder=" "
            :value="`${guests.rooms} номер • ${guests.adults} взр. • ${guests.children} дет.`"
            @click="guestsPopover = true"
          />
          <span :class="$style.placeholder">Гости</span>
          <UIcon
            name="i-heroicons-chevron-down-20-solid"
            :class="$style.calendarIcon"
          />
        </div>

        <template #content>
          <div :class="$style.guestsDropdown">
            <div :class="$style.guestOption">
              <span>Номера</span>
              <div :class="$style.counter">
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  :disabled="guests.rooms <= 1"
                  @click="guests.rooms--"
                >
                  -
                </UButton>
                <span>{{ guests.rooms }}</span>
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  @click="guests.rooms++"
                >
                  +
                </UButton>
              </div>
            </div>

            <div :class="$style.guestOption">
              <span>Количество взрослых</span>
              <div :class="$style.counter">
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  :disabled="guests.adults <= 0"
                  @click="guests.adults--"
                >
                  -
                </UButton>
                <span>{{ guests.adults }}</span>
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  @click="guests.adults++"
                >
                  +
                </UButton>
              </div>
            </div>

            <div :class="$style.guestOption">
              <span>Дети (до 12 лет)</span>
              <div :class="$style.counter">
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  :disabled="guests.children <= 0"
                  @click="guests.children--"
                >
                  -
                </UButton>
                <span>{{ guests.children }}</span>
                <UButton
                  size="xs"
                  color="gray"
                  variant="outline"
                  @click="guests.children++"
                >
                  +
                </UButton>
              </div>
            </div>

            <UButton
              block
              color="primary"
              :class="$style.applyButton"
              @click="guestsPopover = false"
            >
              Готово
            </UButton>
          </div>
        </template>
      </UPopover>

      <div :class="$style.inputWrapper">
        <input
          v-model="promoCode"
          :class="$style.customInput"
          placeholder=" "
        />
        <span :class="$style.placeholder">Специальный код</span>
      </div>

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
    gap: rem(20);
    max-width: size.$desktop;
    min-width: rem(400);
    min-height: rem(50);
    padding: rem(24) rem(28);
    background-color: var(--primary);
    border-radius: rem(8);
  }

  .input {
    width: 200px;
    //    background-color: white;
    border-radius: rem(4);

    &:hover {
      background-color: var(--ui-color-primary-200);
    }
    &:focus {
      background-color: var(--ui-color-primary-200);
    }
  }

  .inputWrapper {
    position: relative;
    width: 200px;
  }

  .customInput {
    width: 100%;
    height: rem(44);
    padding: 12px 30px 0 12px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 14px;
    color: #111827;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .placeholder {
    position: absolute;
    top: 6px;
    left: 12px;
    font-size: 11px;
    color: #6b7280;
    pointer-events: none;
  }

  .calendarIcon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    width: 18px;
    height: 18px;
  }

  .clearButton {
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
</style>
