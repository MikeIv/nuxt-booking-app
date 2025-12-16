<script setup lang="ts">
import type { BookingDetailsRoom } from "~/types/booking-details";
import { formatCount } from "~/utils/declension";
import { formatPrice } from "~/utils/price";
import { useDateLocale } from "~/composables/useDateLocale";

interface Props {
  startDate?: string;
  endDate?: string;
  nights: number;
  rooms?: BookingDetailsRoom[];
  totalPrice: number;
}

const props = defineProps<Props>();

const { dateLocale } = useDateLocale();

const expandedRooms = ref<Record<number, boolean>>({});

const toggleRoomDetails = (roomIdx: number) => {
  expandedRooms.value[roomIdx] = !expandedRooms.value[roomIdx];
};

const isRoomExpanded = (roomIdx: number) => {
  return !!expandedRooms.value[roomIdx];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale.value, {
      day: "numeric",
      month: "long",
    });
  } catch {
    return "—";
  }
};

const formatWeekday = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("ru-RU", {
      weekday: "long",
    });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  } catch {
    return "";
  }
};

const checkInWeekday = computed(() => formatWeekday(props.startDate));
const checkOutWeekday = computed(() => formatWeekday(props.endDate));

const formattedStartDate = computed(() => formatDate(props.startDate));
const formattedEndDate = computed(() => formatDate(props.endDate));
const formattedTotalPrice = computed(() => formatPrice(props.totalPrice));
</script>

<template>
  <section :class="$style.section">
    <h3 :class="$style.sectionTitle">Ваше бронирование</h3>
    
    <div :class="$style.bookingSummaryInner">
      <div :class="$style.datesBlock">
        <div :class="$style.dateRow">
          <span :class="$style.bookingDetailLabel">
            {{ formattedStartDate }}
          </span>
          <UIcon name="i-arrow-long" :class="$style.detailIcon" />
          <span :class="$style.bookingDetailLabel">
            {{ formattedEndDate }}
          </span>
        </div>
        <div :class="$style.weekdayRow">
          <span :class="$style.detailDay">{{ checkInWeekday }}</span>
          <span :class="$style.weekday">
            {{ formatCount(nights, "night") }}
          </span>
          <span :class="[$style.detailDay, $style.dayRight]">{{ checkOutWeekday }}</span>
        </div>
      </div>

      <ul v-if="rooms" :class="$style.roomsList">
        <li
          v-for="(room, index) in rooms"
          :key="index"
          :class="$style.roomsListItem"
        >
          <BookingDetailsRoomItem
            :room="room"
            :index="index"
            :is-expanded="isRoomExpanded(index)"
            @toggle="toggleRoomDetails(index)"
          />
        </li>
      </ul>

      <hr :class="$style.summaryDivider" />
      <footer :class="$style.grandTotal">
        <span>Итого:</span>
        <strong>{{ formattedTotalPrice }} ₽</strong>
      </footer>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(24) 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(20);
      padding: rem(28) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(24);
      padding: rem(32) 0;
    }
  }

  .sectionTitle {
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(26);
    }
  }

  .bookingSummaryInner {
    display: flex;
    flex-direction: column;
    gap: rem(16);
  }

  .datesBlock {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: rem(20) rem(16);
    background: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);

    @media (min-width: #{size.$tablet}) {
      padding: rem(30) rem(20);
    }
  }

  .dateRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .weekdayRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
  }

  .bookingDetailLabel {
    font-family: "Lora", serif;
    font-size: rem(16);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(18);
    }
  }

  .detailIcon {
    width: rem(48);
    height: rem(6);
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      width: rem(62);
      height: rem(8);
    }
  }

  .detailDay {
    width: calc(100% / 3);
    font-family: "Lora", serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(16);
    }
  }

  .dayRight {
    text-align: right;
  }

  .weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: rem(2) rem(12);
    font-family: "Lora", serif;
    font-size: rem(12);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--card);
    white-space: nowrap;

    @media (min-width: #{size.$tablet}) {
      padding: rem(2) rem(18);
      font-size: rem(14);
    }
  }

  .roomsList {
    display: flex;
    flex-direction: column;
    gap: rem(10);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .roomsListItem {
    margin: 0;
    padding: 0;
  }

  .summaryDivider {
    width: 100%;
    height: rem(1);
    margin: rem(8) 0;
    padding: 0;
    border: none;
    background-color: var(--a-black);
  }

  .grandTotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(12);
    font-family: "Lora", serif;
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(20);
    }

    strong {
      font-size: rem(20);

      @media (min-width: #{size.$tablet}) {
        font-size: rem(24);
      }
    }
  }
</style>

