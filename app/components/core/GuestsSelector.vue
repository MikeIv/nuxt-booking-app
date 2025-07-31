<script setup lang="ts">
  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        rooms: null,
        adults: null,
        children: null,
      }),
    },
  });

  const emit = defineEmits(["update:modelValue"]);

  const guestsPopover = ref(false);

  const guests = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
  });

  function updateGuests(key: "rooms" | "adults" | "children", delta: number) {
    guests.value = {
      ...guests.value,
      [key]: Math.max(0, guests.value[key] + delta),
    };
  }
</script>

<template>
  <UPopover v-model:open="guestsPopover">
    <div :class="$style.inputWrapper">
      <input
        readonly
        :class="$style.customInput"
        placeholder=""
        :value="`${guests.rooms} номер, ${guests.adults} взр., ${guests.children} дет.`"
        @click="guestsPopover = true"
      />
      <span :class="$style.label">Гости</span>
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
              @click="updateGuests('rooms', -1)"
            >
              -
            </UButton>
            <span>{{ guests.rooms }}</span>
            <UButton
              size="xs"
              color="gray"
              variant="outline"
              @click="updateGuests('rooms', 1)"
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
              @click="updateGuests('adults', -1)"
            >
              -
            </UButton>
            <span>{{ guests.adults }}</span>
            <UButton
              size="xs"
              color="gray"
              variant="outline"
              @click="updateGuests('adults', 1)"
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
              @click="updateGuests('children', -1)"
            >
              -
            </UButton>
            <span>{{ guests.children }}</span>
            <UButton
              size="xs"
              color="gray"
              variant="outline"
              @click="updateGuests('children', 1)"
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
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .inputWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(366);
    gap: rem(4);
  }

  .customInput {
    width: 100%;
    height: rem(67);
    padding: rem(22) rem(36) rem(2) rem(12);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-black);
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: rem(16);

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .label {
    position: absolute;
    top: rem(8);
    left: rem(8);
    font-size: rem(12);
    font-weight: 400;
    font-family: Inter, sans-serif;
    color: var(--a-text-light);
    margin-left: rem(12);
    z-index: z.z("booking-label");
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

  .guestsDropdown {
    padding: 16px;
    min-width: 300px;
  }

  .guestOption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .applyButton {
    margin-top: 16px;
  }
</style>
