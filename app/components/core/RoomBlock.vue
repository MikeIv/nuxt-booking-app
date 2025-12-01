<script setup lang="ts">
import type { RoomGuests } from "~/components/core/GuestsSelector.vue";
import { AGE_MIN } from "~/utils/age";

interface Props {
  room: RoomGuests;
  roomIndex: number;
  totalRooms: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:adults": [value: number];
  "update:children": [value: number];
  "update:childAge": [childIndex: number, age: number];
  "delete": [];
}>();

function updateAdults(value: number) {
  emit("update:adults", value);
}

function updateChildren(value: number) {
  emit("update:children", value);
}

function updateChildAge(childIndex: number, age: number) {
  emit("update:childAge", childIndex, age);
}

const roomTitle = computed(() =>
  props.totalRooms > 1 ? `Номер ${props.roomIndex + 1}` : "Номер",
);
</script>

<template>
  <div :class="$style.roomGroup">
    <div :class="$style.roomTitle">
      <span>{{ roomTitle }}</span>
      <Button
        v-if="totalRooms > 1"
        type="button"
        unstyled
        :class="$style.deleteRoomButton"
        @click="emit('delete')"
      >
        <UIcon name="i-trash" :class="$style.deleteIcon" />
      </Button>
    </div>

    <div :class="$style.guestOption">
      <span :class="$style.name">Количество взрослых</span>
      <CoreCounter
        :model-value="room.adults"
        :min="1"
        @update:model-value="updateAdults"
      />
    </div>

    <hr :class="$style.line" />

    <div :class="$style.guestOption">
      <div :class="$style.nameBlock">
        <span :class="$style.name">Количество детей</span>
        <span :class="[$style.name, $style.subName]">Младше 12 лет</span>
      </div>
      <CoreCounter
        :model-value="room.children"
        :min="0"
        @update:model-value="updateChildren"
      />
    </div>

    <div v-if="room.children > 0" :class="$style.childrenAgesWrapper">
      <CoreChildAgeSelector
        v-for="(_, childIdx) in Array.from({ length: room.children })"
        :key="`child-${roomIndex}-${childIdx}`"
        :model-value="room.childrenAges[childIdx] ?? AGE_MIN"
        :total-children="room.children"
        :child-index="childIdx + 1"
        @update:model-value="(age: number) => updateChildAge(childIdx, age)"
      />
    </div>
  </div>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.roomGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: rem(16);
}

.guestOption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: rem(6);
  font-family: "Inter", sans-serif;
}

.roomTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: rem(40);
  margin: 0 rem(-16) rem(8) rem(-16);
  padding: rem(6) rem(20) rem(6) rem(16);
  font-family: "Inter", sans-serif;
  font-size: rem(18);
  color: var(--a-black);
  background-color: var(--a-accentLightBg);

  @media (min-width: #{size.$desktopMin}) {
    margin: 0 rem(-24) rem(12) rem(-24);
    padding: rem(6) rem(30) rem(6) rem(24);
  }
}

.deleteRoomButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: rem(24);
  height: rem(24);
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: rem(2) solid var(--primary);
    outline-offset: rem(2);
    border-radius: rem(4);
  }
}

.deleteIcon {
  width: rem(28);
  height: rem(28);
  color: var(--a-text-white);
}

.nameBlock {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.name {
  font-family: "Inter", sans-serif;
  font-size: rem(18);
  color: var(--a-text-dark);
  text-wrap: wrap;

  @media (min-width: #{size.$desktopMin}) {
    font-size: rem(22);
  }
}

.subName {
  font-family: "Inter", sans-serif;
  font-size: rem(14);
  color: var(--a-text-primary);
}

.line {
  border: none;
  border-top: rem(1) solid var(--a-border-primary);
  margin: rem(8) 0 rem(8);
}

.childrenAgesWrapper {
  display: flex;
  flex-direction: column;
  gap: rem(12);
  margin-top: rem(8);
}
</style>

