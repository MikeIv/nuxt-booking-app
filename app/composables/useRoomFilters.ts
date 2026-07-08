import type { Ref } from "vue";
import type { Room } from "~/types/room";
import type { SearchFilters } from "~/types/booking";

const VIEW_OPTIONS = [
  { id: 0, title: "Вид из окна" },
  { id: 1, title: "Парк" },
  { id: 2, title: "Город" },
  { id: 3, title: "Море" },
  { id: 4, title: "Внутренний двор" },
] as const;

const BALCONY_OPTIONS = [
  { id: 0, title: "Балкон" },
  { id: 1, title: "Есть балкон" },
  { id: 2, title: "Нет балкона" },
] as const;

const BALCONY_REGEX = /балкон/i;

function roomOrVariantMatches(
  room: Room,
  predicate: (item: Room) => boolean,
): boolean {
  if (predicate(room)) {
    return true;
  }

  return room.room_type_codes?.some(predicate) ?? false;
}

function addAllOption<T extends { id: number; title: string }>(
  serverFilters: T[] | undefined,
  defaultOptions: readonly T[],
  allOptionTitle: string,
): T[] {
  if (!serverFilters || serverFilters.length === 0) {
    return [...defaultOptions];
  }

  const hasAllOption = serverFilters[0]?.id === 0;
  if (hasAllOption) {
    return serverFilters;
  }

  return [{ id: 0, title: allOptionTitle } as T, ...serverFilters];
}

function hasBalconyAmenity(room: Room): boolean {
  if (room.amenities?.length) {
    for (const amenity of room.amenities) {
      if (amenity.title && BALCONY_REGEX.test(amenity.title)) {
        return true;
      }
    }
  }

  const variants = room.room_type_codes;
  if (!variants || variants.length === 0) {
    return false;
  }

  for (const variant of variants) {
    if (!variant.amenities?.length) continue;
    for (const amenity of variant.amenities) {
      if (amenity.title && BALCONY_REGEX.test(amenity.title)) {
        return true;
      }
    }
  }

  return false;
}

function hasAnyBalconyResource(room: Room): boolean {
  return roomOrVariantMatches(room, (item) => Boolean(item.balcony?.id));
}

function hasSelectedBalcony(room: Room, balconyId: number): boolean {
  return roomOrVariantMatches(room, (item) => item.balcony?.id === balconyId);
}

function usesServerBalconyFilters(filters: SearchFilters | undefined): boolean {
  return Boolean(filters?.balconies?.length);
}

function usesServerViewFilters(filters: SearchFilters | undefined): boolean {
  return Boolean(filters?.views?.length);
}

function getMatchingViewVariants(room: Room, viewId: number): Room[] | null {
  const variants = room.room_type_codes;
  if (!variants || variants.length === 0) {
    return room.view?.id === viewId ? [room] : null;
  }

  const matchingVariants = variants.filter(
    (variant) => variant.view?.id === viewId,
  );
  return matchingVariants.length > 0 ? matchingVariants : null;
}

function hasSelectedView(room: Room, viewId: number): boolean {
  return getMatchingViewVariants(room, viewId) !== null;
}

function normalizeVariantMinPrice(variants: Room[]): number | null {
  const prices = variants
    .map((variant) => variant.min_price)
    .filter((price): price is number => price !== null && price !== undefined);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

/** Оставляет только варианты с нужным view (API: view только у beds/SearchResource). */
function narrowRoomByView(room: Room, viewId: number): Room | null {
  const matchingVariants = getMatchingViewVariants(room, viewId);
  if (!matchingVariants) {
    return null;
  }

  const variants = room.room_type_codes;
  if (
    !variants ||
    variants.length === 0 ||
    matchingVariants.length === variants.length
  ) {
    return room;
  }

  const primaryVariant = matchingVariants[0];
  return {
    ...room,
    room_type_code: primaryVariant?.room_type_code ?? room.room_type_code,
    view: primaryVariant?.view ?? null,
    bed: primaryVariant?.bed ?? null,
    balcony: primaryVariant?.balcony ?? null,
    min_price: normalizeVariantMinPrice(matchingVariants) ?? room.min_price,
    room_type_codes: matchingVariants,
  };
}

function applyBalconyFilter(
  room: Room,
  activeBalcony: number,
  serverBalconyFilters: boolean,
): boolean {
  if (!activeBalcony) {
    return true;
  }

  if (serverBalconyFilters) {
    return hasSelectedBalcony(room, activeBalcony);
  }

  const hasBalcony = hasBalconyAmenity(room) || hasAnyBalconyResource(room);
  if (activeBalcony === 1 && !hasBalcony) return false;
  if (activeBalcony === 2 && hasBalcony) return false;
  return true;
}

function applyViewFilter(
  room: Room,
  activeView: number,
  serverViewFilters: boolean,
): Room | null {
  if (!activeView) {
    return room;
  }

  if (serverViewFilters) {
    return narrowRoomByView(room, activeView);
  }

  return hasSelectedView(room, activeView) ? room : null;
}

function applyRoomFilters(
  room: Room,
  activeView: number,
  activeBalcony: number,
  serverViewFilters: boolean,
  serverBalconyFilters: boolean,
): Room | null {
  const roomByView = applyViewFilter(room, activeView, serverViewFilters);
  if (!roomByView) {
    return null;
  }

  if (!applyBalconyFilter(roomByView, activeBalcony, serverBalconyFilters)) {
    return null;
  }

  return roomByView;
}

export interface FilteredRoomCard {
  room: Room;
  cardIdx: number;
}

export function useRoomFilters(filters: Ref<SearchFilters | undefined>) {
  const selectedView = ref<number>(0);
  const selectedBalcony = ref<number>(0);

  const viewOptions = computed(() =>
    addAllOption(filters.value?.views, VIEW_OPTIONS, "Вид из окна"),
  );

  const balconyOptions = computed(() =>
    addAllOption(filters.value?.balconies, BALCONY_OPTIONS, "Балкон"),
  );

  const getActiveFilters = () => ({
    activeView: selectedView.value,
    activeBalcony: selectedBalcony.value,
    serverViewFilters: usesServerViewFilters(filters.value),
    serverBalconyFilters: usesServerBalconyFilters(filters.value),
  });

  const filterRoomList = (rooms: Room[] | null | undefined): Room[] => {
    if (!rooms?.length) return [];

    const {
      activeView,
      activeBalcony,
      serverViewFilters,
      serverBalconyFilters,
    } = getActiveFilters();
    if (!activeView && !activeBalcony) {
      return rooms;
    }

    const result: Room[] = [];
    for (const room of rooms) {
      const filteredRoom = applyRoomFilters(
        room,
        activeView,
        activeBalcony,
        serverViewFilters,
        serverBalconyFilters,
      );
      if (filteredRoom) {
        result.push(filteredRoom);
      }
    }
    return result;
  };

  const filterRoomListWithIndex = (
    rooms: Room[] | null | undefined,
  ): FilteredRoomCard[] => {
    if (!rooms?.length) return [];

    const {
      activeView,
      activeBalcony,
      serverViewFilters,
      serverBalconyFilters,
    } = getActiveFilters();
    if (!activeView && !activeBalcony) {
      return rooms.map((room, cardIdx) => ({ room, cardIdx }));
    }

    const result: FilteredRoomCard[] = [];
    for (let cardIdx = 0; cardIdx < rooms.length; cardIdx++) {
      const filteredRoom = applyRoomFilters(
        rooms[cardIdx],
        activeView,
        activeBalcony,
        serverViewFilters,
        serverBalconyFilters,
      );
      if (filteredRoom) {
        result.push({ room: filteredRoom, cardIdx });
      }
    }
    return result;
  };

  watch(
    filters,
    () => {
      if (selectedView.value !== 0) {
        const viewExists = viewOptions.value.some(
          (option) => option.id === selectedView.value,
        );
        if (!viewExists) {
          selectedView.value = 0;
        }
      }

      if (selectedBalcony.value !== 0) {
        const balconyExists = balconyOptions.value.some(
          (option) => option.id === selectedBalcony.value,
        );
        if (!balconyExists) {
          selectedBalcony.value = 0;
        }
      }
    },
    { immediate: false },
  );

  return {
    selectedView,
    selectedBalcony,
    viewOptions,
    balconyOptions,
    filterRoomList,
    filterRoomListWithIndex,
  };
}
