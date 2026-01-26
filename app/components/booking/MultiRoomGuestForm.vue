<script setup lang="ts">
import type { GuestData, FormField, RoomGuestData } from "~/composables/usePersonalForm";
import BookingGuestComposition from "~/components/booking/GuestComposition.vue";

interface RoomEntry {
  roomIdx: number;
  roomCardIdx: number;
  roomTitle: string;
  room_type_code: string;
  ratePlanCode: string;
  price: number | null | undefined;
  title: string;
}

interface Props {
  roomEntries: RoomEntry[];
  roomGuests: Record<number, RoomGuestData>;
  formFields: FormField[];
  errors: Record<number, { mainGuest: Partial<GuestData>; additionalGuests: Array<Partial<GuestData>> }>;
  getRoomGuestComposition: (roomIdx: number) => { adults: number; children: number };
  checkboxOptions: Array<{
    id: string;
    key: string;
    label: string;
  }>;
  formData: Record<number, { smsConfirmation: boolean; specialOffers: boolean }>;
  canAddRoomAdditionalGuest: (roomIdx: number) => boolean;
  expandedRooms: Record<number, boolean>;
}

interface Emits {
  (e: "toggle:room" | "add:additionalGuest", roomIdx: number): void;
  (e: "update:mainGuest", payload: { roomIdx: number; guest: GuestData }): void;
  (e: "update:additionalGuest", payload: { roomIdx: number; guestIndex: number; guest: GuestData }): void;
  (e: "remove:additionalGuest", payload: { roomIdx: number; guestIndex: number }): void;
  (e: "update:formData", payload: { roomIdx: number; key: string; value: boolean }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toggleRoom = (roomIdx: number) => {
  emit("toggle:room", roomIdx);
};

const isRoomExpanded = (roomIdx: number) => {
  return !!props.expandedRooms[roomIdx];
};

const updateMainGuest = (roomIdx: number, guest: GuestData) => {
  emit("update:mainGuest", { roomIdx, guest });
};

const updateAdditionalGuest = (roomIdx: number, guestIndex: number, guest: GuestData) => {
  emit("update:additionalGuest", { roomIdx, guestIndex, guest });
};

const removeAdditionalGuest = (roomIdx: number, guestIndex: number) => {
  emit("remove:additionalGuest", { roomIdx, guestIndex });
};

const addAdditionalGuest = (roomIdx: number) => {
  emit("add:additionalGuest", roomIdx);
};

const updateCheckbox = (roomIdx: number, key: string, value: boolean) => {
  emit("update:formData", { roomIdx, key, value: value as boolean });
};
</script>

<template>
  <div
    v-for="entry in roomEntries"
    :key="entry.roomIdx"
    :class="$style.formItem"
  >
    <Button
      type="button"
      :class="$style.roomButton"
      class="btn__bs dark round"
      unstyled
      :aria-expanded="isRoomExpanded(entry.roomIdx)"
      @click="toggleRoom(entry.roomIdx)"
    >
      <span :class="$style.roomButtonGuestsTitle">Данные гостей.</span>
      <span :class="$style.roomButtonText">
        Номер {{ entry.roomIdx + 1 }}
      </span>
      <div :class="$style.roomButtonIconWrapper">
        <UIcon
          name="i-chevron-down"
          :class="[
            $style.roomButtonIcon,
            {
              [$style.roomButtonIconRotated]: isRoomExpanded(entry.roomIdx),
            },
          ]"
        />
      </div>
    </Button>
    <Transition name="fade">
      <div
        v-if="isRoomExpanded(entry.roomIdx)"
        :class="$style.roomFormContent"
      >
        <BookingGuestComposition
          :adults="getRoomGuestComposition(entry.roomIdx).adults"
          :children="getRoomGuestComposition(entry.roomIdx).children"
        />
        <BookingGuestFormFields
          :guest="roomGuests[entry.roomIdx]?.mainGuest || {
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            email: '',
            citizenship: ''
          }"
          :fields="formFields"
          :errors="errors[entry.roomIdx]?.mainGuest || {}"
          guest-title="Основной гость"
          @update:guest="updateMainGuest(entry.roomIdx, $event)"
        />
        <div :class="$style.checkInformBlock">
          <div
            v-for="checkbox in checkboxOptions"
            :key="checkbox.id"
            :class="$style.checkItem"
          >
            <Checkbox
              :model-value="formData[entry.roomIdx]?.[checkbox.key] || false"
              :input-id="`${checkbox.id}-${entry.roomIdx}`"
              :binary="true"
              :class="$style.checkbox"
              @update:model-value="updateCheckbox(entry.roomIdx, checkbox.key, $event)"
            />
            <label
              :for="`${checkbox.id}-${entry.roomIdx}`"
              :class="$style.checkboxLabel"
            >
              {{ checkbox.label }}
            </label>
          </div>
        </div>
        <BookingGuestFormFields
          v-for="(guest, index) in roomGuests[entry.roomIdx]?.additionalGuests || []"
          :key="index"
          :guest="guest"
          :fields="formFields"
          :errors="errors[entry.roomIdx]?.additionalGuests[index] || {}"
          :guest-title="`Гость ${index + 2}`"
          :show-remove="true"
          @update:guest="updateAdditionalGuest(entry.roomIdx, index, $event)"
          @remove="removeAdditionalGuest(entry.roomIdx, index)"
        />
        <Button
          v-if="canAddRoomAdditionalGuest(entry.roomIdx)"
          type="button"
          :class="$style.addGuestButton"
          unstyled
          @click="addAdditionalGuest(entry.roomIdx)"
        >
          <UIcon
            name="i-icon-plus-person2"
            :class="$style.addGuestIcon"
            aria-hidden="true"
          />
          <span>Добавить гостя (необязательно)</span>
        </Button>
      </div>
    </Transition>
  </div>
</template>

<style module lang="scss">
.formItem {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  padding: rem(24) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
  &:last-of-type {
    border-bottom: none;
  }
}

.roomButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: rem(8);
  width: 100%;
  padding: 0 rem(20);
  height: rem(49);
  margin-bottom: rem(16);
}

.roomButtonText {
  flex: 1;
  text-align: left;
  font-family: "Inter", sans-serif;
  font-size: rem(20);
  font-weight: 700;
  color: var(--a-white);
}

.roomButtonGuestsTitle {
  flex-shrink: 0;
  font-family: "Inter", sans-serif;
  font-size: rem(20);
  font-weight: 700;
  color: var(--a-white);
}

.roomButtonIconWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: rem(28);
  height: rem(28);
  background: var(--a-white);
  border-radius: 50%;
  flex-shrink: 0;
}

.roomButtonIcon {
  width: rem(16);
  height: rem(16);
  color: var(--a-text-dark);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.roomButtonIconRotated {
  transform: rotate(180deg);
}

.roomFormContent {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  padding: rem(16);
  margin-top: rem(8);
}

.checkInformBlock {
  display: flex;
  flex-direction: column;
  gap: rem(16);
}

.checkItem {
  display: flex;
  align-items: flex-start;
  gap: rem(12);
  :global {
    .p-checkbox {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: rem(20);
      height: rem(20);
      min-width: rem(20);
      border: rem(2) solid var(--a-border-light);
      border-radius: rem(4);
      background: var(--a-whiteBg);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .p-checkbox-checked {
      background-color: var(--a-whiteBg);
      border-color: var(--a-border-primary);
      &:before {
        content: "✓";
        color: var(--a-text-primary);
        font-size: rem(14);
        font-weight: bold;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.checkbox {
  margin-top: rem(4);
  &:hover {
    border-color: var(--a-border-primary);
  }
  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .p-checkbox-icon {
    display: none;
  }
}

.checkboxLabel {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  color: var(--a-text-dark);
  line-height: 1.4;
  cursor: pointer;
  margin-top: rem(2);
  flex: 1;
}

.addGuestButton {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: rem(12);
  width: fit-content;
  height: rem(54);
  padding: 0 rem(16);
  border: rem(1) solid var(--a-border-dark);
  border-radius: var(--a-borderR--card);
  background: transparent;
  color: var(--a-text-dark);
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    border-color: var(--a-border-primary);
    color: var(--a-text-primary);
    background-color: rgba(var(--a-primaryBg), 0.05);
  }
  &:focus {
    outline: none;
    border-color: var(--a-border-primary);
    box-shadow: 0 0 0 2px rgba(var(--a-border-primary), 0.1);
  }
}

.addGuestIcon {
  width: rem(18);
  height: rem(18);
  color: var(--a-text-light);
  flex-shrink: 0;
}
</style>
