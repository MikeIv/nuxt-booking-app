<script setup lang="ts">
import type { BookingDetailsRoom } from "~/types/booking-details";
import { formatCount } from "~/utils/declension";
import type { DeclensionRules } from "~/utils/declension";
import { formatPrice } from "~/utils/price";

interface Props {
  room: BookingDetailsRoom;
  index: number;
  isExpanded: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
}>();

const handleToggle = () => emit("toggle");

const ADULT_DECLENSION: DeclensionRules = {
  one: "взрослый",
  few: "взрослых",
  many: "взрослых",
};

const CHILD_DECLENSION: DeclensionRules = {
  one: "ребёнок",
  few: "ребёнка",
  many: "детей",
};
</script>

<template>
  <article :class="$style.roomItem">
    <Button
      type="button"
      :class="$style.roomButton"
      class="btn__bs dark round"
      unstyled
      :aria-expanded="props.isExpanded"
      @click="handleToggle"
    >
      <span :class="$style.roomButtonText">
        Номер {{ props.index + 1 }}
      </span>
      <UIcon
        name="i-chevron-down"
        :class="[
          $style.roomButtonIcon,
        {
          [$style.roomButtonIconRotated]: props.isExpanded,
        },
        ]"
      />
    </Button>
    
    <Transition name="fade">
      <section v-if="isExpanded" :class="$style.roomDetails">
        <header :class="$style.roomDetailsHeader">
          <h4 :class="$style.roomType">{{ props.room.title }}</h4>
          <span :class="$style.roomPriceLabel">
            {{ formatPrice(props.room.tariff.price) }} ₽
          </span>
        </header>
        <p :class="$style.roomTariff">{{ props.room.tariff.title }}</p>
        <hr :class="$style.roomDivider" />
        <p :class="$style.roomGuestLine">
          {{ formatCount(props.room.guests.adults, ADULT_DECLENSION) }} на основном месте
        </p>
        <p v-if="props.room.guests.children > 0" :class="$style.roomGuestLine">
          {{ formatCount(props.room.guests.children, CHILD_DECLENSION) }} на дополнительном месте
        </p>
        <template v-if="props.room.services && Array.isArray(props.room.services) && props.room.services.length > 0">
          <hr :class="$style.roomDivider" />
          <section :class="$style.servicesSection">
            <h5 :class="$style.servicesHeader">Дополнительные услуги:</h5>
            <ul :class="$style.servicesList">
              <li
                v-for="(service, sIndex) in props.room.services"
                :key="sIndex"
                :class="$style.serviceItem"
              >
                <span :class="$style.serviceTitle">{{ service }}</span>
              </li>
            </ul>
          </section>
        </template>
        <hr :class="$style.roomDivider" />
        <footer :class="$style.roomTotal">
          <span>Итого за Номер {{ props.index + 1 }}:</span>
          <strong>{{ formatPrice(props.room.total) }} ₽</strong>
        </footer>
      </section>
    </Transition>
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .roomItem {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    padding: rem(12) 0;
  }

  .roomButton {
    display: flex;
    align-items: center;
    gap: rem(8);
    padding: 0 rem(16);
    width: 100%;
  }

  .roomButtonText {
    flex: 1;
    text-align: left;
    font-family: Inter, sans-serif;
    font-size: rem(14);
    color: var(--a-white);
  }

  .roomButtonIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-white);
    transition: transform 0.3s ease;
  }

  .roomButtonIconRotated {
    transform: rotate(180deg);
  }

  .roomDetails {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(16);
  }

  .roomDetailsHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .roomType {
    width: 50%;
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }
  }

  .roomPriceLabel {
    font-family: "Lora", serif;
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-dark);
    white-space: nowrap;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .roomTariff {
    font-family: "Lora", serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .roomDivider {
    width: 100%;
    height: rem(1);
    margin: 0;
    padding: 0;
    border: none;
    background-color: var(--a-border-dark);
  }

  .roomGuestLine {
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
    margin: 0;
  }

  .servicesSection {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(8) 0;
  }

  .servicesHeader {
    font-family: "Lora", serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .servicesList {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .serviceItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  .serviceTitle {
    flex: 1;
    font-family: Inter, sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .roomTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }

    strong {
      font-family: "Lora", serif;
      font-size: rem(16);
      font-weight: 600;

      @media (min-width: #{size.$tablet}) {
        font-size: rem(18);
      }
    }
  }

  :global(.fade-enter-active),
  :global(.fade-leave-active) {
    transition: opacity 0.3s ease;
  }

  :global(.fade-enter-from),
  :global(.fade-leave-to) {
    opacity: 0;
  }
</style>

