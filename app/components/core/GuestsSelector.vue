<script setup lang="ts">
  interface RoomGuests {
    adults: number;
    children: number;
  }
  interface GuestsValue {
    rooms: number;
    roomList: RoomGuests[];
  }

  const MAX_ROOMS = 5;
  const props = defineProps<{
    modelValue:
      | GuestsValue
      | { rooms: number; adults: number; children: number };
  }>();
  const emit = defineEmits(["update:modelValue"]);
  const guestsPopover = ref(false);

  const guests = computed<GuestsValue>({
    get: () => {
      if (!props.modelValue || typeof props.modelValue !== "object") {
        return {
          rooms: 1,
          roomList: [{ adults: 1, children: 0 }],
        };
      }
      if (
        "roomList" in props.modelValue &&
        Array.isArray(props.modelValue.roomList)
      ) {
        return props.modelValue as GuestsValue;
      }
      return {
        rooms: props.modelValue.rooms ?? 1,
        roomList: Array.from({ length: props.modelValue.rooms ?? 1 }).map(
          (_, idx) =>
            idx === 0
              ? {
                  adults: props.modelValue.adults ?? 1,
                  children: props.modelValue.children ?? 0,
                }
              : { adults: 1, children: 0 },
        ),
      };
    },
    set: (val) => emit("update:modelValue", val),
  });

  function updateRooms(delta: number) {
    let nextRooms = guests.value.rooms + delta;
    nextRooms = Math.max(1, Math.min(MAX_ROOMS, nextRooms));
    const roomList = guests.value.roomList.slice(0, nextRooms);
    for (let i = roomList.length; i < nextRooms; i++)
      roomList.push({ adults: 1, children: 0 });
    guests.value = { rooms: nextRooms, roomList };
  }

  function updateRoomGuests(
    roomIdx: number,
    key: keyof RoomGuests,
    delta: number,
  ) {
    const roomList = guests.value.roomList.map((room, idx) =>
      idx === roomIdx
        ? {
            ...room,
            [key]: Math.max(key === "adults" ? 1 : 0, room[key] + delta),
          }
        : room,
    );
    guests.value = { ...guests.value, roomList };
  }

  const summaryString = computed(() => {
    const roomList = guests.value.roomList;
    const totalAdults = roomList.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = roomList.reduce((sum, r) => sum + r.children, 0);
    return `${guests.value.rooms} номер${guests.value.rooms > 1 ? "а" : ""}, ${totalAdults} взр., ${totalChildren} дет.`;
  });
</script>

<template>
  <UPopover v-model:open="guestsPopover">
    <div :class="$style.inputWrapper">
      <input
        readonly
        :class="$style.customInput"
        :aria-label="`Гости: ${summaryString}`"
        :value="summaryString"
        @click="guestsPopover = true"
      />
      <span :class="$style.label">Гости</span>
      <UIcon name="i-chevron-down" :class="$style.chevronIcon" />
    </div>

    <template #content>
      <div :class="$style.guestsDropdown">
        <div :class="$style.guestOption">
          <span :class="$style.roomsTitle">Номера</span>
          <div :class="$style.counter">
            <Button
              type="button"
              unstyled
              :class="$style.setButton"
              :disabled="guests.rooms <= 1"
              @click="updateRooms(-1)"
              >-</Button
            >
            <span :class="$style.count">{{ guests.rooms }}</span>
            <Button
              type="button"
              unstyled
              :class="$style.setButton"
              :disabled="guests.rooms >= MAX_ROOMS"
              @click="updateRooms(1)"
              >+</Button
            >
          </div>
        </div>

        <div
          v-for="(room, idx) in guests.roomList"
          :key="idx"
          :class="$style.roomGroup"
        >
          <div v-if="guests.rooms > 1" :class="$style.roomTitle">
            Номер {{ idx + 1 }}
          </div>

          <div :class="$style.guestOption">
            <span :class="$style.name">Количество взрослых</span>
            <div :class="$style.counter">
              <Button
                type="button"
                unstyled
                :class="$style.setButton"
                :disabled="room.adults <= 1"
                @click="updateRoomGuests(idx, 'adults', -1)"
                >-</Button
              >
              <span :class="$style.count">{{ room.adults }}</span>
              <Button
                type="button"
                unstyled
                :class="$style.setButton"
                @click="updateRoomGuests(idx, 'adults', 1)"
                >+</Button
              >
            </div>
          </div>

          <hr v-if="guests.rooms > 1" :class="$style.line" />

          <div :class="$style.guestOption">
            <div :class="$style.nameBlock">
              <span :class="$style.name">Дети</span>
              <span :class="[$style.name, $style.color]">(до 12 лет)</span>
            </div>
            <div :class="$style.counter">
              <Button
                type="button"
                unstyled
                :class="$style.setButton"
                :disabled="room.children <= 0"
                @click="updateRoomGuests(idx, 'children', -1)"
                >-</Button
              >
              <span :class="$style.count">{{ room.children }}</span>
              <Button
                type="button"
                unstyled
                :class="$style.setButton"
                @click="updateRoomGuests(idx, 'children', 1)"
                >+</Button
              >
            </div>
          </div>
        </div>

        <Button
          class="btn__bs"
          :class="$style.applyButton"
          unstyled
          @click="guestsPopover = false"
          >Готово</Button
        >
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

    @media (min-width: #{size.$desktopMin}) {
      min-width: rem(600);
      padding: rem(24);
    }
  }

  .guestOption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(18);
    font-family: "Inter", sans-serif;
  }

  .roomsTitle {
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-black);
  }

  .roomTitle {
    margin: 0 rem(-16) rem(8) rem(-16);
    padding: rem(2) rem(16);
    font-family: "Inter", sans-serif;
    font-size: rem(18);
    color: var(--a-black);
    background-color: var(--a-accentLightBg);

    @media (min-width: #{size.$desktopMin}) {
      margin: 0 rem(-24) rem(12) rem(-24);
      padding: rem(2) rem(24);
    }
  }

  .nameBlock {
    display: flex;
    flex-direction: column;
    gap: rem(2);
  }

  .name {
    font-size: rem(18);
    color: var(--a-black);
    text-wrap: wrap;

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }

    &.color {
      color: var(--a-text-light);
    }
  }

  .line {
    border: none;
    border-top: rem(1) solid var(--a-border-primary);
    margin: rem(16) 0 rem(8);
  }

  .setButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(34);
    height: rem(34);
    font-size: rem(24);
    color: var(--a-white);
    background-color: var(--a-accentLightBg);
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background-color: var(--a-accentBg);
    }

    &:disabled {
      background-color: var(--a-accentLightBg);
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: none;
      background-color: var(--a-accentBg);
    }
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
