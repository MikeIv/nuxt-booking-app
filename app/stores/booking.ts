import { defineStore } from "pinia";
import type { StateTree } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import type {
  PackageResource,
  Room,
  RoomTariff,
  TariffGroup,
} from "~/types/room";
import type {
  SearchResponse,
  BookingData,
  BookingResponse,
  BookingHistoryItem,
  BookingByUuidPayload,
  ApiRoomTariff,
  ApiRoomType,
  ApiGroupedRoom,
  ApiGroupedPayload,
  ApiUngroupedPayload,
  ApiRoomTariffPayload,
  ApiSearchPayload,
  SelectedEntry,
} from "~/types/booking";
import {
  getSortedMultiRoomEntries,
  normalizeRoomIndex,
} from "~/utils/multiBooking";
import {
  mapBookingShowToHistoryItem,
  normalizeBookingByUuidPayload,
} from "~/utils/mapBookingShowToHistoryItem";
import { toBookingAllowedActionsArray } from "~/utils/bookingAllowedActions";

export interface UserProfileData {
  name: string;
  surname: string;
  middle_name: string;
  phone: string;
  email: string;
  country: string;
}

export interface SelectedService {
  id: number;
  title: string;
  price: number;
  packageCode?: string;
}

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref<{
      rooms: number;
      roomList: { adults: number; children: number; childrenAges: number[] }[];
    }>({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    });

    const promoCode = ref("");
    const loading = ref(false);
    const isServerRequest = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<SearchResponse | null>(null);
    const selectedRoomType = ref<string | null>(null);
    const selectedTariff = ref<RoomTariff | null>(null);
    const roomTariffs = ref<Room[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");
    const userProfiles = ref<Record<string, UserProfileData>>({});

    const selectedServicesByRoom = ref<Record<string, SelectedService[]>>({});
    const createdBooking = ref<BookingResponse | null>(null);
    const bookingsByUuid = ref<Record<string, BookingResponse>>({});
    const currentBookingUuid = ref<string | null>(null);
    const currentBookingDetails = ref<BookingHistoryItem | null>(null);
    const packages = ref<PackageResource[]>([]);
    const selectedMultiRooms = ref<Record<string, SelectedEntry>>({});
    const changeRoomUuid = ref<string | null>(null);
    const changeServicesUuid = ref<string | null>(null);
    /** Индексы номеров без доступности в последнем multi-поиске (для подсветки в GuestsSelector) */
    const multiBookingUnavailableRooms = ref<number[]>([]);

    function setMultiBookingUnavailableRooms(indices: number[]) {
      multiBookingUnavailableRooms.value = indices;
    }

    function clearMultiBookingUnavailableRooms() {
      multiBookingUnavailableRooms.value = [];
    }

    /** Услуги для одного номера (режим одного номера — индекс 0) */
    const selectedServices = computed(() => {
      const list = selectedServicesByRoom.value["0"] ?? [];
      return [...list];
    });

    function addService(service: SelectedService, roomIndex?: number) {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      if (list.some((s) => s.id === service.id)) return;
      selectedServicesByRoom.value = {
        ...selectedServicesByRoom.value,
        [key]: [...list, service],
      };
    }

    function removeService(serviceId: number, roomIndex?: number) {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      const index = list.findIndex((s) => s.id === serviceId);
      if (index === -1) return;
      const next = list.slice(0, index).concat(list.slice(index + 1));
      selectedServicesByRoom.value = {
        ...selectedServicesByRoom.value,
        [key]: next,
      };
    }

    function isServiceSelected(serviceId: number, roomIndex?: number): boolean {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      return list.some((s) => s.id === serviceId);
    }

    function getSelectedServicesForRoom(roomIndex: number): SelectedService[] {
      return selectedServicesByRoom.value[String(roomIndex)] ?? [];
    }

    function setSelectedServicesByRoom(
      value: Record<string, SelectedService[]>,
    ) {
      selectedServicesByRoom.value = { ...value };
    }

    function setRoomTariffs(value: Room[]) {
      roomTariffs.value = value;
    }

    function setCurrentBookingDetails(booking: BookingHistoryItem | null) {
      currentBookingDetails.value = booking;
    }

    function setBookingByUuid(booking: BookingResponse | null) {
      if (!booking) return;
      const uuid =
        typeof booking.uuid === "string" && booking.uuid.trim() !== ""
          ? booking.uuid
          : null;
      if (!uuid) return;

      bookingsByUuid.value = {
        ...bookingsByUuid.value,
        [uuid]: booking,
      };
      currentBookingUuid.value = uuid;
      createdBooking.value = {
        ...booking,
        allowed: toBookingAllowedActionsArray(booking.allowed),
      };
    }

    function getSessionBookingByUuid(uuid: string): BookingResponse | null {
      const safeUuid = uuid.trim();
      if (!safeUuid) return null;
      return bookingsByUuid.value[safeUuid] ?? null;
    }

    function setSelectedMultiRooms(rooms: Record<string, SelectedEntry>) {
      selectedMultiRooms.value = { ...rooms };
    }

    function setServerRequest(value: boolean) {
      isServerRequest.value = value;
    }

    function setGuests(value: {
      rooms: number;
      roomList: { adults: number; children: number; childrenAges: number[] }[];
    }) {
      guests.value = value;
    }

    function setSearchResults(value: SearchResponse | null) {
      searchResults.value = value;
    }

    function setSelectedTariff(value: RoomTariff | null) {
      selectedTariff.value = value;
    }

    function setDate(value: [Date, Date] | null) {
      date.value = value;
    }

    function setChangeRoomUuid(value: string | null) {
      changeRoomUuid.value = value;
    }

    function setChangeServicesUuid(value: string | null) {
      changeServicesUuid.value = value;
    }

    const totalGuests = computed(() => {
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
      return totalAdults + totalChildren;
    });

    const setLoading = (visible: boolean, message?: string) => {
      loading.value = visible;
      if (message) {
        loadingMessage.value = message;
      }
    };

    function saveUserProfile(userId: number, profile: UserProfileData) {
      userProfiles.value = {
        ...userProfiles.value,
        [String(userId)]: { ...profile },
      };
    }

    const formatDate = (value: Date | string): string => {
      if (typeof value === "string") return value;
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throw new Error(`Неверный формат даты: ${String(value)}`);
      }
      // Форматируем дату в локальном часовом поясе, чтобы избежать смещения на день
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    function validateSearchParams() {
      if (!date.value) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите даты");
      }
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      if (totalAdults === 0) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите количество гостей");
      }
      const [startDate] = date.value;
      // Сравниваем по календарному дню: дата заезда «сегодня» допустима
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      if (startDay < todayStart) {
        searchResults.value = null;
        setLoading(false);
        isServerRequest.value = false;
        throw new Error(
          "Выбранные даты устарели. Пожалуйста, выберите новые даты.",
        );
      }
    }

    const ensureChildAges = (count: number, ages: number[]): number[] => {
      if (count === 0) return [];
      if (ages.length === count) return ages;
      return Array.from({ length: count }, (_, index) => ages[index] ?? 0);
    };

    /** Максимум гостей (взрослые + дети) в одном номере — синхрон с GuestsSelector */
    const MAX_GUESTS_PER_ROOM = 15;

    const clampRoomGuests = (adults: number, children: number) => {
      let a = adults;
      let c = children;
      if (a + c > MAX_GUESTS_PER_ROOM) {
        a = Math.min(a, MAX_GUESTS_PER_ROOM);
        c = Math.max(0, MAX_GUESTS_PER_ROOM - a);
      }
      return { adults: a, children: c };
    };

    const normalizeMinPrice = (
      price: number | string | null | undefined,
    ): number | null => {
      if (price === null || price === undefined) return null;
      if (typeof price === "string") {
        const trimmed = price.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return price;
    };

    const mapTariffs = (tariffs?: ApiRoomTariff[]): RoomTariff[] => {
      if (!tariffs || tariffs.length === 0) return [];
      return tariffs.map((tariff) => {
        // Формируем cancellation_popover из cancellation_description, если он есть
        let cancellation_popover:
          | { title?: string; description?: string }
          | undefined;
        if (tariff.cancellation_popover) {
          cancellation_popover = tariff.cancellation_popover;
        } else if (
          tariff.cancellation_description &&
          tariff.cancellation_free
        ) {
          // Если есть cancellation_description и отмена бесплатная, создаем popover
          cancellation_popover = {
            title: "Бесплатная отмена",
            description: tariff.cancellation_description,
          };
        }

        return {
          rate_plan_code: tariff.rate_plan_code,
          title: tariff.title,
          price:
            typeof tariff.price === "string"
              ? Number(tariff.price)
              : tariff.price,
          price_for_register: tariff.price_for_register,
          room_prices: tariff.room_prices?.map((roomPrice) => ({
            room_index: normalizeRoomIndex(roomPrice.room_index),
            room_number: roomPrice.room_number,
            room_type_code: roomPrice.room_type_code,
            rate_plan_code: roomPrice.rate_plan_code,
            price:
              typeof roomPrice.price === "string"
                ? Number(roomPrice.price)
                : roomPrice.price,
            price_for_register: roomPrice.price_for_register,
            packages: roomPrice.packages,
          })),
          packages: tariff.packages ?? [],
          has_food: tariff.has_food,
          cancellation_free: tariff.cancellation_free,
          payment_types: tariff.payment_types ?? [],
          // Используем cancellation_description, если description не указан
          description:
            tariff.description ?? tariff.cancellation_description ?? null,
          cancellation_popover,
          group: tariff.group
            ? { id: tariff.group.id, title: tariff.group.title }
            : undefined,
        };
      });
    };

    const mapRoom = (room: ApiRoomType, group?: ApiGroupedRoom): Room => {
      return {
        id: room.id ?? room.room_type_code,
        room_type_code: room.room_type_code,
        title: room.title ?? group?.title ?? "",
        description: room.description ?? group?.description ?? null,
        max_occupancy: room.max_occupancy ?? group?.max_occupancy ?? 0,
        square: room.square ?? group?.square ?? 0,
        rooms: room.rooms ?? group?.rooms ?? 0,
        amenities:
          room.amenities && room.amenities.length > 0
            ? room.amenities
            : (group?.amenities ?? []),
        bed: room.bed ?? null,
        view: room.view ?? null,
        family: room.family ?? null,
        min_price: normalizeMinPrice(room.min_price ?? group?.min_price),
        price_for_register:
          room.price_for_register ?? group?.price_for_register ?? undefined,
        photos:
          room.photos && room.photos.length > 0
            ? room.photos
            : (group?.photos ?? []),
        tariffs: mapTariffs(room.tariffs),
        group_title: group?.title,
        group_description: group?.description ?? null,
      };
    };

    const mapGroupedRoom = (group: ApiGroupedRoom): Room => {
      // Сервер может возвращать варианты как "beds" или "room_type_codes"
      const variantsSource = group.beds ?? group.room_type_codes ?? [];
      const variants = variantsSource.map((variant) => mapRoom(variant, group));

      const primaryVariant = variants[0];

      const firstVariant = variantsSource[0];
      const roomTypeCode =
        primaryVariant?.room_type_code &&
        primaryVariant.room_type_code.trim() !== "" &&
        primaryVariant.room_type_code !== group.title
          ? primaryVariant.room_type_code
          : firstVariant?.room_type_code &&
              firstVariant.room_type_code.trim() !== "" &&
              firstVariant.room_type_code !== group.title
            ? firstVariant.room_type_code
            : "";

      // Собираем тарифы из всех вариантов
      const tariffsSet = new Map<string, RoomTariff>();
      variants.forEach((variant) => {
        if (variant.tariffs && variant.tariffs.length > 0) {
          variant.tariffs.forEach((tariff) => {
            if (!tariffsSet.has(tariff.rate_plan_code)) {
              tariffsSet.set(tariff.rate_plan_code, tariff);
            }
          });
        }
      });
      const allTariffs = Array.from(tariffsSet.values());

      return {
        id: primaryVariant?.id ?? group.title,
        room_type_code: roomTypeCode,
        title: group.title ?? primaryVariant?.title ?? "",
        description: group.description ?? primaryVariant?.description ?? null,
        max_occupancy:
          group.max_occupancy ?? primaryVariant?.max_occupancy ?? 0,
        square: group.square ?? primaryVariant?.square ?? 0,
        rooms: group.rooms ?? primaryVariant?.rooms ?? 0,
        amenities:
          group.amenities && group.amenities.length > 0
            ? group.amenities
            : (primaryVariant?.amenities ?? []),
        bed: primaryVariant?.bed ?? null,
        view: primaryVariant?.view ?? null,
        family: primaryVariant?.family ?? null,
        min_price: normalizeMinPrice(
          group.min_price ?? primaryVariant?.min_price,
        ),
        price_for_register:
          group.price_for_register ?? primaryVariant?.price_for_register,
        photos:
          group.photos && group.photos.length > 0
            ? group.photos
            : (primaryVariant?.photos ?? []),
        tariffs: allTariffs,
        room_type_codes: variants,
        group_title: group.title,
        group_description: group.description ?? null,
      } satisfies Room;
    };

    const EMPTY_FILTERS: SearchResponse["filters"] = {
      beds: [],
      views: [],
      balconies: [],
    };

    const extractTariffGroups = (
      payload: ApiSearchPayload,
    ): TariffGroup[] | undefined => {
      if (!payload || Array.isArray(payload) || !("tariff_groups" in payload)) {
        return undefined;
      }

      const groups = payload.tariff_groups;
      if (!groups?.length) return undefined;

      return groups.map(({ id, title }) => ({ id, title }));
    };

    /**
     * Объединяет дубликат Room при группировке:
     * мержит варианты (room_type_codes), обновляет min_price, фото и удобства.
     */
    const mergeGroupedRoom = (existing: Room, incoming: Room): void => {
      const variantMap = new Map<string, Room>();
      (existing.room_type_codes ?? []).forEach((v, i) => {
        variantMap.set(v.room_type_code ?? v.id?.toString() ?? `v-${i}`, v);
      });
      (incoming.room_type_codes ?? []).forEach((v, i) => {
        variantMap.set(v.room_type_code ?? v.id?.toString() ?? `v-new-${i}`, v);
      });
      existing.room_type_codes = Array.from(variantMap.values());

      const incomingPrice = normalizeMinPrice(incoming.min_price);
      if (existing.min_price === null) {
        existing.min_price = incomingPrice;
      } else if (incomingPrice !== null) {
        existing.min_price = Math.min(existing.min_price, incomingPrice);
      }

      if (
        existing.price_for_register === undefined ||
        (incoming.price_for_register !== undefined &&
          incoming.price_for_register < existing.price_for_register)
      ) {
        existing.price_for_register = incoming.price_for_register;
      }

      if (!existing.photos?.length && incoming.photos?.length) {
        existing.photos = incoming.photos;
      }
      if (!existing.amenities?.length && incoming.amenities?.length) {
        existing.amenities = incoming.amenities;
      }
    };

    /**
     * Преобразует список ApiGroupedRoom[] в SearchResponse, объединяя дубликаты по ключу семейства/группы.
     * Используется для форматов 3 (ApiGroupedPayload) и 5 (устаревший массив без фильтров).
     */
    const processGroupedRooms = (
      groups: ApiGroupedRoom[],
      rawPayload: ApiSearchPayload,
      filters?: SearchResponse["filters"],
    ): SearchResponse => {
      const groupedRooms = new Map<string, Room>();

      groups.forEach((group, index) => {
        const room = mapGroupedRoom(group);

        const firstVariant = group.beds?.[0] ?? group.room_type_codes?.[0];
        const key =
          firstVariant?.family?.id?.toString() ??
          firstVariant?.family?.title ??
          group.title ??
          room.room_type_code ??
          `group-${index}`;

        const existing = groupedRooms.get(key);
        if (existing) {
          mergeGroupedRoom(existing, room);
        } else {
          groupedRooms.set(key, room);
        }
      });

      const rooms = Array.from(groupedRooms.values());
      return {
        available: rooms.length > 0,
        rooms,
        packages: [],
        filters: filters ?? EMPTY_FILTERS,
        groupedByBed: true,
        rawPayload,
      };
    };

    /**
     * Нормализует сырой ответ API поиска в унифицированный `SearchResponse`.
     *
     * Поддерживаемые форматы ответа:
     * 1. `undefined` / falsy — нет данных
     * 2. `ApiRoomTariffPayload` (`{ room, packages? }`) — один номер с тарифами (страница /rooms/tariff)
     * 3. `ApiGroupedPayload` (`{ rooms: ApiGroupedRoom[], filters }`) — сгруппированные номера
     * 4. `ApiUngroupedPayload` (`{ rooms: ApiRoomType[], filters, packages? }`) — плоский список (multi_booking_mode)
     * 5. `ApiGroupedRoom[]` — устаревший массив без фильтров
     */
    const normalizeSearchPayload = (
      payload: ApiSearchPayload,
      groupedByBed: boolean,
    ): SearchResponse => {
      // Формат 1: пустой ответ
      if (!payload) {
        return {
          available: false,
          rooms: [],
          packages: [],
          filters: EMPTY_FILTERS,
          groupedByBed,
          rawPayload: payload,
        };
      }

      // Формат 2: один номер с тарифами — страница /rooms/tariff
      if (!Array.isArray(payload) && "room" in payload && payload.room) {
        const p = payload as ApiRoomTariffPayload;
        return {
          available: true,
          rooms: [mapRoom(p.room)],
          packages: p.packages ?? [],
          filters: EMPTY_FILTERS,
          groupedByBed: false,
          tariffGroups: extractTariffGroups(payload),
          rawPayload: payload,
        };
      }

      // Формат 5: устаревший массив ApiGroupedRoom[] (без фильтров)
      if (Array.isArray(payload)) {
        return processGroupedRooms(payload, payload);
      }

      // Форматы 3 и 4: объект { rooms: [...], filters }
      if (
        "rooms" in payload &&
        Array.isArray(payload.rooms) &&
        "filters" in payload
      ) {
        const firstRoom = payload.rooms.find((r) => r != null);

        if (!firstRoom) {
          // Пустой список номеров — ungrouped fallback
          const p = payload as ApiUngroupedPayload;
          return {
            available: false,
            rooms: [],
            packages: p.packages ?? [],
            filters: p.filters ?? EMPTY_FILTERS,
            groupedByBed: false,
            rawPayload: payload,
          };
        }

        // Формат 3: grouped — каждый элемент содержит beds или room_type_codes (вложенные варианты)
        if ("beds" in firstRoom || "room_type_codes" in firstRoom) {
          const p = payload as ApiGroupedPayload;
          return processGroupedRooms(p.rooms, payload, p.filters);
        }

        // Формат 4: ungrouped — плоские ApiRoomType с тарифами (multi_booking_mode: true)
        const p = payload as ApiUngroupedPayload;
        return {
          available: p.rooms.length > 0,
          rooms: p.rooms.map((r) => mapRoom(r)),
          packages: p.packages ?? [],
          filters: p.filters ?? EMPTY_FILTERS,
          groupedByBed: false,
          rawPayload: payload,
        };
      }

      // Fallback: ApiUngroupedPayload без распознанной структуры
      const p = payload as ApiUngroupedPayload;
      const rooms = (p.rooms ?? []).map((r) => mapRoom(r));
      return {
        available: rooms.length > 0,
        rooms,
        packages: p.packages ?? [],
        filters: p.filters ?? EMPTY_FILTERS,
        groupedByBed,
        rawPayload: payload,
      };
    };

    function prepareSearchData(roomTypeCode?: string, roomIndex?: number) {
      const [startDate, endDate] = date.value!;

      const list = guests.value.roomList ?? [];
      const isSingleRoomRequest = roomIndex !== undefined;
      const guestsPayload = isSingleRoomRequest
        ? (() => {
            const room = list[roomIndex!];
            if (!room) return [];
            const { adults, children } = clampRoomGuests(
              room.adults,
              room.children,
            );
            const childs = ensureChildAges(
              children,
              (room.childrenAges ?? []).slice(0, children),
            );
            return [{ adults, childs }];
          })()
        : list.map((room) => {
            const { adults, children } = clampRoomGuests(
              room.adults,
              room.children,
            );
            const childs = ensureChildAges(
              children,
              (room.childrenAges ?? []).slice(0, children),
            );
            return { adults, childs };
          });

      const groupedByBed = guestsPayload.length <= 1;
      const multiBookingMode = !isSingleRoomRequest && guestsPayload.length > 1;

      const searchData: Record<string, unknown> = {
        start_at: formatDate(startDate),
        end_at: formatDate(endDate),
        promocode: promoCode.value || null,
        multi_booking_mode: multiBookingMode,
        grouped_by_bed: groupedByBed,
        room_type_code: roomTypeCode ?? null,
        guests: guestsPayload,
      };

      return { searchData, groupedByBed };
    }

    function setSelectedRoomType(roomTypeCode: string | null) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    /** Применить улучшение номера: подставить номер повышенного комфорта в выбор и сводку */
    function _applyUpgradeRoom(room: Room) {
      const list = roomTariffs.value;
      const exists = list.some((r) => r.room_type_code === room.room_type_code);
      if (!exists) {
        roomTariffs.value = [...list, room];
      }
      selectedRoomType.value = room.room_type_code;
      const targetRatePlanCode = selectedTariff.value?.rate_plan_code ?? null;
      const nextTariff =
        (targetRatePlanCode
          ? room.tariffs?.find((t) => t.rate_plan_code === targetRatePlanCode)
          : null) ??
        room.tariffs?.[0] ??
        null;

      selectedTariff.value = nextTariff;
    }

    async function search(options?: {
      roomTypeCode?: string;
      skipReset?: boolean;
    }): Promise<SearchResponse> {
      validateSearchParams();
      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;

      const roomTypeCode = options?.roomTypeCode;
      const skipReset = options?.skipReset ?? false;

      if (roomTypeCode) {
        selectedRoomType.value = roomTypeCode;
      }

      let apiError: Error | null = null;

      try {
        const { post } = useApi();
        const { searchData, groupedByBed } = prepareSearchData(roomTypeCode);
        if (roomTypeCode) {
          searchData.grouped = true;
        }
        const multiBookingMode = (searchData.guests as unknown[])?.length > 1;
        // При мультибронировании бэкенд может обрабатывать запрос дольше — увеличиваем таймаут
        const searchTimeoutMs = multiBookingMode ? 35000 : 15000;

        isServerRequest.value = true;
        const response = await post<ApiSearchPayload>(
          "/v1/search",
          searchData,
          {
            signal: AbortSignal.timeout(searchTimeoutMs),
          },
        );

        if (response.success) {
          const normalized = normalizeSearchPayload(
            response.payload,
            groupedByBed,
          );
          searchResults.value = normalized;
          roomTariffs.value = normalized.rooms;
          return normalized;
        }

        apiError = new Error(response.message || "Ошибка при поиске номеров");
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        if (!skipReset) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    async function createBooking(bookingData: BookingData) {
      const { post } = useApi();

      setLoading(true, "Создаём бронирование...");

      let skipLoadingReset = false;
      let apiError: Error | null = null;

      try {
        const processedData: BookingData = {
          for_self: bookingData.for_self,
          start_at: bookingData.start_at || "",
          end_at: bookingData.end_at || "",
          adults: bookingData.adults ?? 1,
          children: bookingData.children ?? 0,
          payment: bookingData.payment || "",
          agreements: bookingData.agreements,
          children_ages: bookingData.children_ages || [],
          additional: {
            start_at: bookingData.additional?.start_at || null,
            end_at: bookingData.additional?.end_at || null,
            comment: bookingData.additional?.comment || null,
          },
          rooms: bookingData.rooms.map((room) => ({
            room_type_code: room.room_type_code,
            rate_type_code: room.rate_type_code,
            packages: room.packages,
            adults: room.adults,
            children: room.children,
            children_ages: room.children_ages,
            guests: room.guests.map((guest) => ({
              surname: guest.surname,
              name: guest.name,
              middle_name: guest.middle_name || null,
              phone: guest.phone,
              email: guest.email,
              nationality: guest.nationality || "",
              sms_confirmation: guest.sms_confirmation || false,
              email_subscribe: guest.email_subscribe || false,
            })),
          })),
        };

        if (import.meta?.env?.DEV) {
          console.log(
            "📤 Отправка данных бронирования:",
            JSON.stringify(processedData, null, 2),
          );
        }

        const multiRoomBooking = processedData.rooms.length > 1;
        const bookingTimeoutMs = multiRoomBooking ? 35000 : 15000;

        isServerRequest.value = true;
        const response = await post<BookingResponse>(
          "/v1/booking",
          processedData,
          { signal: AbortSignal.timeout(bookingTimeoutMs) },
        );

        if (response.success && response.payload) {
          setBookingByUuid(response.payload);
          if (response.payload.redirect_url) {
            skipLoadingReset = true;
          }
          return response.payload;
        }

        apiError = new Error(response.message || "Ошибка при создании брони");
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при бронировании";
        throw err;
      } finally {
        if (!skipLoadingReset) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    /**
     * Детали брони из ЛК. GET /v1/booking/{uuid} (booking.show).
     * bookingId — uuid заказа из истории (поле id в BookingResource).
     */
    async function getBookingDetails(bookingId: string | number) {
      const { get } = useApi();
      const bookingUuid = String(bookingId).trim();

      if (!bookingUuid) {
        throw new Error("Не указан идентификатор бронирования");
      }

      setLoading(true, "Загружаем детали брони...");

      let apiError: Error | null = null;

      try {
        isServerRequest.value = true;
        const response = await get<BookingByUuidPayload>(
          `/v1/booking/${bookingUuid}`,
          {},
          {
            signal: AbortSignal.timeout(10000),
          },
        );

        if (response.success && response.payload) {
          const normalized = normalizeBookingByUuidPayload(response.payload);
          const bookingDetails = mapBookingShowToHistoryItem(response.payload);
          setBookingByUuid(normalized);
          setCurrentBookingDetails(bookingDetails);
          return bookingDetails;
        }

        apiError = new Error(
          response.message || "Ошибка при получении данных брони",
        );
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке данных";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    /**
     * Загрузка бронирования по uuid (страница подтверждения после редиректа с оплаты).
     * GET /v1/booking/{uuid}
     */
    async function getBookingByUuid(
      uuid: string,
      options?: { silent?: boolean },
    ): Promise<BookingResponse> {
      const { get } = useApi();
      const silent = options?.silent ?? false;

      if (!silent) {
        setLoading(true, "Загружаем данные бронирования...");
      }

      let apiError: Error | null = null;

      try {
        if (!silent) {
          isServerRequest.value = true;
        }
        const response = await get<BookingByUuidPayload>(
          `/v1/booking/${uuid}`,
          {},
          { signal: AbortSignal.timeout(15000) },
        );

        if (response.success && response.payload) {
          const normalized = normalizeBookingByUuidPayload(response.payload);
          setBookingByUuid(normalized);
          return normalized;
        }

        apiError = new Error(
          response.message || "Ошибка при загрузке бронирования",
        );
      } catch (err: unknown) {
        error.value =
          (err as Error).message ||
          "Произошла ошибка при загрузке бронирования";
        throw err;
      } finally {
        if (!silent) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    async function searchPackages(
      roomIndex?: number,
    ): Promise<PackageResource[]> {
      validateSearchParams();
      error.value = null;

      let apiError: Error | null = null;

      try {
        const { post } = useApi();

        const sortedMulti = getSortedMultiRoomEntries(selectedMultiRooms.value);
        const isMultiRoom = sortedMulti.length > 0;

        // Для мультибронирования: roomIndex здесь — логический индекс номера (entry.roomIdx / guests.roomList index).
        // Ищем запись по совпадению roomIdx (устойчиво к порядку ключей), с fallback на позицию для совместимости.
        let effectiveRoomIndex: number | undefined = undefined;
        let targetEntry: (typeof sortedMulti)[number] | undefined = undefined;

        if (isMultiRoom) {
          effectiveRoomIndex = roomIndex ?? 0;
          targetEntry = sortedMulti.find(
            (e) => e.roomIdx === effectiveRoomIndex,
          );
          if (
            !targetEntry &&
            effectiveRoomIndex != null &&
            effectiveRoomIndex < sortedMulti.length
          ) {
            targetEntry = sortedMulti[effectiveRoomIndex];
          }
        }
        let roomTypeCode: string | undefined;
        let ratePlanCode: string | undefined;

        if (isMultiRoom && targetEntry) {
          roomTypeCode =
            targetEntry.room_type_code?.trim() !== ""
              ? targetEntry.room_type_code
              : undefined;
          ratePlanCode = targetEntry.ratePlanCode;
        } else if (!isMultiRoom) {
          const code = selectedRoomType.value;
          roomTypeCode = code && code.trim() !== "" ? code : undefined;
          ratePlanCode = selectedTariff.value?.rate_plan_code;
        }

        const { searchData } = prepareSearchData(
          roomTypeCode,
          effectiveRoomIndex,
        );

        const packagesSearchData: Record<string, unknown> = {
          ...searchData,
          ...(ratePlanCode ? { rate_plan_code: ratePlanCode } : {}),
        };

        isServerRequest.value = true;
        const response = await post<PackageResource[]>(
          "/v1/search/packages",
          packagesSearchData,
          {
            signal: AbortSignal.timeout(10000),
          },
        );

        if (response.success && response.payload) {
          packages.value = response.payload;
          return response.payload;
        }

        apiError = new Error(response.message || "Ошибка при получении услуг");
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке услуг";
        packages.value = [];
        throw err;
      } finally {
        isServerRequest.value = false;
      }

      error.value = apiError!.message;
      packages.value = [];
      throw apiError!;
    }

    function forceReset() {
      date.value = null;
      guests.value = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };
      promoCode.value = "";
      error.value = null;
      searchResults.value = null;
      selectedRoomType.value = null;
      roomTariffs.value = [];
      selectedServicesByRoom.value = {};
      createdBooking.value = null;
      bookingsByUuid.value = {};
      currentBookingUuid.value = null;
      currentBookingDetails.value = null;
      selectedMultiRooms.value = {};
      changeRoomUuid.value = null;
      changeServicesUuid.value = null;
      multiBookingUnavailableRooms.value = [];
      setLoading(false);
      isServerRequest.value = false;
      // deliberately preserve persisted state (e.g., userProfiles)
    }

    return {
      date,
      guests,
      promoCode,
      loading,
      isServerRequest,
      error,
      searchResults,
      totalGuests,
      selectedRoomType,
      selectedTariff,
      roomTariffs,
      loadingMessage,
      forceReset,
      setSelectedRoomType,
      applyUpgradeRoom: _applyUpgradeRoom,
      setLoading,
      search,
      createBooking,
      getBookingDetails,
      getBookingByUuid,
      formatDate,
      userProfiles,
      saveUserProfile,
      selectedServices,
      selectedServicesByRoom,
      addService,
      removeService,
      isServiceSelected,
      getSelectedServicesForRoom,
      setSelectedServicesByRoom,
      setRoomTariffs,
      createdBooking,
      bookingsByUuid,
      currentBookingUuid,
      setBookingByUuid,
      getSessionBookingByUuid,
      currentBookingDetails,
      setCurrentBookingDetails,
      packages,
      searchPackages,
      selectedMultiRooms,
      setSelectedMultiRooms,
      changeRoomUuid,
      changeServicesUuid,
      setServerRequest,
      setGuests,
      setSearchResults,
      setSelectedTariff,
      setDate,
      setChangeRoomUuid,
      setChangeServicesUuid,
      multiBookingUnavailableRooms,
      setMultiBookingUnavailableRooms,
      clearMultiBookingUnavailableRooms,
    };
  },
  {
    persist: {
      key: "booking-store",
      paths: [
        "date",
        "guests",
        "promoCode",
        "selectedRoomType",
        "selectedTariff",
        "userProfiles",
        "selectedServicesByRoom",
        "selectedMultiRooms",
      ],
      serializer: {
        serialize: (state: StateTree) => {
          const serialized = { ...state } as Record<string, unknown> & {
            date?: unknown;
          };
          if (serialized.date && Array.isArray(serialized.date)) {
            serialized.date = (serialized.date as unknown[]).map((d) =>
              d instanceof Date ? d.toISOString() : d,
            );
          }
          try {
            return JSON.stringify(serialized);
          } catch {
            // Fallback: сохраняем только критически важные поля без объёмных данных
            const minimal = {
              date: serialized.date,
              guests: serialized.guests,
              promoCode: serialized.promoCode,
            };
            return JSON.stringify(minimal);
          }
        },
        deserialize: (str: string) => {
          const state = JSON.parse(str);
          if (state.date && Array.isArray(state.date)) {
            state.date = state.date.map((d: string | Date) =>
              typeof d === "string" ? new Date(d) : d,
            );
          }
          return state;
        },
      },
    } as PersistenceOptions,
  },
);
