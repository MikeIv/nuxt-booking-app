<script setup lang="ts">
  interface RoomGuests {
    adults: number;
    children: number;
    childrenAges: number[];
  }
  interface GuestsValue {
    rooms: number;
    roomList: RoomGuests[];
  }

  const MAX_ROOMS = 5;
  const AGE_MIN = 0;
  const AGE_MAX = 12;
  const AGE_OPTIONS = Array.from(
    { length: AGE_MAX - AGE_MIN + 1 },
    (_, i) => i + AGE_MIN,
  );

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
          (r) => ({
            adults: r.adults,
            children: r.children,
            childrenAges: Array.isArray((r as unknown).childrenAges)
              ? (r as unknown).childrenAges.slice(0, r.children).concat(
                  Array.from(
                    {
                      length: Math.max(
                        0,
                        r.children - ((r as unknown).childrenAges?.length ?? 0),
                      ),
                    },
                    () => AGE_MIN,
                  ),
                )
              : Array.from({ length: r.children }, () => AGE_MIN),
          }),
        );
        return {
          rooms: (props.modelValue as GuestsValue).rooms,
          roomList: normalized,
        };
      }
      const rooms = props.modelValue.rooms ?? 1;
      return {
        rooms,
        roomList: Array.from({ length: rooms }).map((_, idx) =>
          idx === 0
            ? {
                adults: (props.modelValue as unknown).adults ?? 1,
                children: (props.modelValue as unknown).children ?? 0,
                childrenAges: Array.from(
                  { length: (props.modelValue as unknown).children ?? 0 },
                  () => AGE_MIN,
                ),
              }
            : { adults: 1, children: 0, childrenAges: [] },
        ),
      };
    },
    set: (val) => emit("update:modelValue", val),
  });

  const overlayRef = ref();

  function openOverlay(event: Event) {
    overlayRef.value?.toggle(event);
  }

  function updateRooms(delta: number) {
    let nextRooms = guests.value.rooms + delta;
    nextRooms = Math.max(1, Math.min(MAX_ROOMS, nextRooms));
    const roomList = guests.value.roomList.slice(0, nextRooms);
    for (let i = roomList.length; i < nextRooms; i++)
      roomList.push({ adults: 1, children: 0, childrenAges: [] });
    guests.value = { rooms: nextRooms, roomList };
  }

  function updateRoomGuests(
    roomIdx: number,
    key: keyof Omit<RoomGuests, "childrenAges">,
    delta: number,
  ) {
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const next = {
        ...room,
        [key]: Math.max(key === "adults" ? 1 : 0, room[key] + delta),
      } as RoomGuests;
      if (key === "children") {
        const count = next.children;
        const ages = room.childrenAges?.slice(0, count) ?? [];
        while (ages.length < count) ages.push(AGE_MIN);
        next.childrenAges = ages;
      }
      return next;
    });
    guests.value = { ...guests.value, roomList };
  }

  function childAgeLabel(totalChildren: number, index1Based: number): string {
    if (totalChildren === 1) return "Возраст ребенка";
    if (index1Based === 1) return "Возраст 1-го ребенка";
    if (index1Based === 2) return "Возраст 2-го ребенка";
    return `Возраст ${index1Based}-го ребенка`;
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

  function getAgeLabel(age: number): string {
    if (age === 0) return "лет";
    if (age === 1) return "год";
    if (age >= 2 && age <= 4) return "года";
    return "лет";
  }

  const summaryString = computed(() => {
    const roomList = guests.value.roomList;
    const totalAdults = roomList.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = roomList.reduce((sum, r) => sum + r.children, 0);
    return `${guests.value.rooms} номер${guests.value.rooms > 1 ? "а" : ""}, ${totalAdults} взр., ${totalChildren} дет.`;
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

          <hr v-if="guests.rooms > 1" :class="$style.line" >

          <div :class="$style.guestOption">
            <div :class="$style.nameBlock">
              <span :class="$style.name">Количество детей</span>
              <span :class="[$style.name, $style.subName]">Младше 13 лет</span>
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

          <div v-if="room.children > 0" :class="$style.childrenAgesWrapper">
            <div
              v-for="childIdx in room.children"
              :key="childIdx"
              :class="$style.childAgeRow"
            >
              <span :class="$style.name">
                {{ childAgeLabel(room.children, childIdx) }}
              </span>
              <div :class="$style.selectBlock">
                <Select
                  :class="$style.ageSelect"
                  :model-value="room.childrenAges[childIdx - 1]"
                  :options="
                    AGE_OPTIONS.map((age) => ({
                      value: age,
                      label: `${age} ${getAgeLabel(age)}`,
                    }))
                  "
                  option-label="label"
                  option-value="value"
                  placeholder="Возраст"
                  :pt="{
                    root: { class: $style.ageSelect },
                    item: { class: $style.ageOption },
                    panel: { class: $style.selectPanel },
                  }"
                  @update:model-value="
                    (val) => updateChildAge(idx, childIdx - 1, val)
                  "
                />
              </div>
            </div>
          </div>
        </div>

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
      width: auto;
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

  .roomGroup {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(16);
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
    border: none;

    &:hover {
      background-color: var(--a-accentBg);
    }

    &:disabled {
      background-color: var(--a-accentLightBg);
      cursor: not-allowed;
      opacity: 0.5;
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

  .childrenAgesWrapper {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    margin-top: rem(8);
  }

  .childAgeRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .selectBlock {
    display: flex;
    align-items: center;

    :global {
      .p-select {
        display: flex;
        align-items: center;
        padding: 0 rem(16);
        font-size: rem(16);
        color: var(--a-text-dark);
        background-color: var(--a-whiteBg);
        border-radius: var(--a-borderR--input);
        transition: border-color 0.3s ease;
        border: rem(1) solid var(--a-border-primary);
      }

      .p-select-label.p-placeholder {
        color: var(--a-text-light);
      }
    }
  }

  .ageSelect {
    width: rem(120);
    height: rem(36);
    font-size: rem(16);
    font-family: "Inter", sans-serif;
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--input);
    color: var(--a-text-dark);
    cursor: pointer;

    @media (min-width: #{size.$desktopMin}) {
      width: rem(148);
    }

    &:focus {
      outline: none;
      border-color: var(--a-accentBg);
    }
  }

  .ageOption {
    padding: rem(8);
    font-family: "Inter", sans-serif;
    font-size: rem(16);
  }
</style>
