<script setup lang="ts">
import { AGE_MIN, AGE_MAX } from "~/utils/age";
import { declension } from "~/utils/declension";

export interface RoomGuests {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface GuestsValue {
  rooms: number;
  roomList: RoomGuests[];
}

interface LegacyGuestsValue {
  rooms: number;
  adults: number;
  children: number;
}

const MAX_ROOMS = 5;

  const props = defineProps<{
    modelValue:
      | GuestsValue
      | { rooms: number; adults: number; children: number };
  }>();
  const emit = defineEmits(["update:modelValue"]);

  const guests = computed<GuestsValue>({
    get: () => {
      if (!props.modelValue || typeof props.modelValue !== "object") {
        return {
          rooms: 1,
          roomList: [{ adults: 1, children: 0, childrenAges: [] }],
        };
      }
      if (
        "roomList" in props.modelValue &&
        Array.isArray(props.modelValue.roomList)
      ) {
        const normalized = (props.modelValue as GuestsValue).roomList.map(
          (r) => {
            const room = r as RoomGuests & { childrenAges?: number[] };
            return {
              adults: room.adults,
              children: room.children,
              childrenAges: Array.isArray(room.childrenAges)
                ? room.childrenAges.slice(0, room.children).concat(
                    Array.from(
                      {
                        length: Math.max(
                          0,
                          room.children - (room.childrenAges?.length ?? 0),
                        ),
                      },
                      () => AGE_MIN,
                    ),
                  )
                : Array.from({ length: room.children }, () => AGE_MIN),
            };
          },
        );
        return {
          rooms: (props.modelValue as GuestsValue).rooms,
          roomList: normalized,
        };
      }
      const rooms = props.modelValue.rooms ?? 1;
      const legacyValue = props.modelValue as LegacyGuestsValue;
      return {
        rooms,
        roomList: Array.from({ length: rooms }).map((_, idx) =>
          idx === 0
            ? {
                adults: legacyValue.adults ?? 1,
                children: legacyValue.children ?? 0,
                childrenAges: Array.from(
                  { length: legacyValue.children ?? 0 },
                  () => AGE_MIN,
                ),
              }
            : { adults: 1, children: 0, childrenAges: [] },
        ),
      };
    },
    set: (val) => emit("update:modelValue", val),
  });

  const overlayRef = ref<{
    toggle: (event: Event) => void;
    hide: (event: Event) => void;
  }>();

  function openOverlay(event: Event) {
    overlayRef.value?.toggle(event);
  }

  function updateRooms(value: number) {
    const nextRooms = Math.max(1, Math.min(MAX_ROOMS, value));
    if (nextRooms === guests.value.rooms) return;
    
    const roomList = guests.value.roomList.slice(0, nextRooms);
    for (let i = roomList.length; i < nextRooms; i++) {
      roomList.push({ adults: 1, children: 0, childrenAges: [] });
    }
    guests.value = { rooms: nextRooms, roomList };
  }

  function deleteRoom(roomIdx: number) {
    if (guests.value.rooms <= 1) return;
    const roomList = guests.value.roomList.filter((_, idx) => idx !== roomIdx);
    guests.value = { rooms: guests.value.rooms - 1, roomList };
  }

  function updateRoomAdults(roomIdx: number, value: number) {
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      return { ...room, adults: Math.max(1, value) };
    });
    guests.value = { ...guests.value, roomList };
  }

  function updateRoomChildren(roomIdx: number, value: number) {
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const count = Math.max(0, value);
      const ages = room.childrenAges?.slice(0, count) ?? [];
      while (ages.length < count) ages.push(AGE_MIN);
      return { ...room, children: count, childrenAges: ages };
    });
    guests.value = { ...guests.value, roomList };
  }

  function updateChildAge(roomIdx: number, childIdx: number, age: number) {
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const ages = room.childrenAges.slice();
      ages[childIdx] = Math.min(AGE_MAX, Math.max(AGE_MIN, Number(age)));
      return { ...room, childrenAges: ages };
    });
    guests.value = { ...guests.value, roomList };
  }

  const summaryString = computed(() => {
    const roomList = guests.value.roomList;
    const totalAdults = roomList.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = roomList.reduce((sum, r) => sum + r.children, 0);
    const roomsWord = declension(guests.value.rooms, "room");
    return `${guests.value.rooms} ${roomsWord}, ${totalAdults} взр., ${totalChildren} дет.`;
  });

  function applyChanges(event: Event) {
    emit("update:modelValue", guests.value);
    overlayRef.value?.hide(event);
  }
</script>

<template>
  <div :class="$style.guestSection">
    <div :class="$style.inputWrapper" @click="openOverlay">
      <input
        readonly
        :class="$style.customInput"
        :aria-label="`Гости: ${summaryString}`"
        :value="summaryString"
      >
      <span :class="$style.label">Гости</span>
      <UIcon name="i-chevron-down" :class="$style.chevronIcon" />
    </div>

    <Popover
      ref="overlayRef"
      class="guests-dropdown"
      :pt="{
        content: { style: 'padding: 0;' },
      }"
    >
      <div :class="$style.guestsDropdownContent">
        <div :class="$style.guestOption">
          <span :class="$style.roomsTitle">Номера</span>
          <CoreCounter
            :model-value="guests.rooms"
            :min="1"
            :max="MAX_ROOMS"
            @update:model-value="(val: number) => updateRooms(val)"
          />
        </div>

        <CoreRoomBlock
          v-for="(room, idx) in guests.roomList"
          :key="`room-${idx}-${guests.rooms}`"
          :room="room"
          :room-index="idx"
          :total-rooms="guests.rooms"
          @update:adults="(val: number) => updateRoomAdults(idx, val)"
          @update:children="(val: number) => updateRoomChildren(idx, val)"
          @update:child-age="(childIdx: number, age: number) => updateChildAge(idx, childIdx, age)"
          @delete="deleteRoom(idx)"
        />

        <Button
          class="btn__bs"
          :class="$style.applyButton"
          unstyled
          @click="applyChanges"
          >Готово</Button
        >
      </div>
    </Popover>
  </div>
</template>

<style lang="scss">
  .guests-dropdown {
    &.p-popover {
      background: var(--a-white);
      border-radius: rem(16);
      box-shadow: 0 4px 23px rgba(0, 0, 0, 0.4);
      border: none;
    }
  }
</style>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .guestSection {
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      width: calc(50% - rem(12));
    }

    @media (min-width: #{size.$desktopMedium}) {
      flex: 1;
      min-width: rem(400);
    }

    @media (min-width: #{size.$desktop}) {
      min-width: rem(500);
    }

    :global {
      .p-select-label.p-placeholder {
        color: var(--a-text-light);
      }
    }
  }

  .inputWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: rem(4);
    cursor: pointer;
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
    border: 1px solid var(--a-border-primary);
    cursor: pointer;

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
    pointer-events: none;
  }

  .chevronIcon {
    position: absolute;
    top: 34%;
    right: rem(12);
    width: rem(30);
    height: rem(30);
    color: var(--primary);
    pointer-events: none;
  }

  .guestsDropdownContent {
    display: flex;
    flex-direction: column;
    min-width: rem(360);
    padding: rem(16);

    @media (min-width: #{size.$desktopMin}) {
      min-width: rem(600);
      padding: rem(24);
    }
  }

  .guestOption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(12);
    font-family: "Inter", sans-serif;
  }

  .roomsTitle {
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-black);
  }

  .applyButton {
    width: 100%;
    height: rem(56);
    margin-top: rem(16);
    color: var(--a-white);
    border-radius: rem(10);
    background-color: var(--a-black);
    border: none;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    font-size: rem(16);
    font-weight: 500;

    &:hover {
      background-color: var(--a-text-dark);
    }
  }
</style>
