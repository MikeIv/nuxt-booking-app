<script setup lang="ts">
  interface GuestData {
    rooms: number | null;
    adults: number | null;
    children: number | null;
  }

  const props = defineProps<{
    modelValue: GuestData;
  }>();

  const emit = defineEmits(["update:modelValue"]);

  const guestsPopover = ref(false);

  const guests = computed({
    get: () => props.modelValue,
    set: (value: GuestData) => emit("update:modelValue", value),
  });
  function updateGuests(key: keyof GuestData, delta: number) {
    guests.value = {
      ...guests.value,
      [key]: Math.max(0, (guests.value[key] ?? 0) + delta),
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
      <UIcon name="i-chevron-down" :class="$style.chevronIcon" />
    </div>

    <template #content>
      <div :class="$style.guestsDropdown">
        <div :class="$style.guestOption">
          <span :class="$style.name">Номера</span>
          <div :class="$style.counter">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
              :disabled="guests.rooms <= 1"
              @click="updateGuests('rooms', -1)"
            >
              -
            </UButton>
            <span :class="$style.count">{{ guests.rooms }}</span>
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
              @click="updateGuests('rooms', 1)"
            >
              +
            </UButton>
          </div>
        </div>

        <div :class="$style.guestOption">
          <span :class="$style.name">Количество взрослых</span>
          <div :class="$style.counter">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
              :disabled="guests.adults <= 0"
              @click="updateGuests('adults', -1)"
            >
              -
            </UButton>
            <span :class="$style.count">{{ guests.adults }}</span>
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
              @click="updateGuests('adults', 1)"
            >
              +
            </UButton>
          </div>
        </div>

        <div :class="$style.guestOption">
          <span :class="$style.name">Дети (до 12 лет)</span>
          <div :class="$style.counter">
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
              :disabled="guests.children <= 0"
              @click="updateGuests('children', -1)"
            >
              -
            </UButton>
            <span :class="$style.count">{{ guests.children }}</span>
            <UButton
              size="xs"
              color="primary"
              variant="solid"
              class="rounded-full"
              :class="$style.setButton"
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
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .inputWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: rem(4);

    @media (min-width: #{size.$desktopMin}) {
      width: calc(50% - rem(12));
    }

    @media (min-width: #{size.$desktopMedium}) {
      width: auto;
      min-width: rem(400);
    }

    @media (min-width: #{size.$desktop}) {
      min-width: rem(500);
    }
  }

  .customInput {
    width: 100%;
    height: rem(67);
    padding: rem(22) rem(36) rem(2) rem(12);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    color: var(--a-black);
    background-color: var(--a-white);
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

  .chevronIcon {
    position: absolute;
    top: 34%;
    right: rem(12);
    width: rem(30);
    height: rem(30);
    color: var(--primary);
    cursor: pointer;
  }

  .guestsDropdown {
    display: flex;
    flex-direction: column;
    min-width: rem(360);
    padding: rem(16);
    border-radius: rem(16);
    border: none;
    background-color: var(--a-white);
    box-shadow: 0 4px 23px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .guestOption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(12);
    font-family: "Inter", sans-serif;
  }

  .name {
    font-size: rem(18);
    color: var(--a-black);
    text-wrap: wrap;
  }

  .setButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(36);
    height: rem(36);
    font-size: rem(24);
    color: var(--a-white);
  }

  .count {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(40);
    height: rem(40);
    font-size: rem(24);
    color: var(--a-black);
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: rem(124);
    margin-left: rem(20);
  }

  .applyButton {
    height: rem(56);
    margin-top: rem(16);
    color: var(--a-white);
    border-radius: rem(10);
    background-color: var(--a-black);
  }
</style>
