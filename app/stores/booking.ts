import { defineStore } from "pinia";
import type { StateTree } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import type {
  PackageResource,
  Room,
  RoomAmenity,
  RoomTariff,
  TariffPackage,
  RoomBed,
  RoomView,
  RoomFamily,
} from "~/types/room";
import type { SearchResponse, BookingData } from "~/types/booking";

interface GuestInfo {
  rooms: number;
  adults: number;
  children: number;
}

export interface UserProfileData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  country: string;
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
    const childrenAges = ref<number[]>([]);
    const selectedRoomType = ref<string | null>(null);
    const roomTariffs = ref<Room[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");
    const roomList = ref<GuestInfo[]>([]);
    const userProfiles = ref<Record<string, UserProfileData>>({});

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

    function updateRoomList(list: GuestInfo[]) {
      roomList.value = list;
    }

    function updateChildrenAges(ages: number[]) {
      childrenAges.value = ages;
    }

    function saveUserProfile(userId: string, profile: UserProfileData) {
      userProfiles.value = {
        ...userProfiles.value,
        [userId]: { ...profile },
      };
    }

    function getUserProfile(userId: string): UserProfileData | null {
      return userProfiles.value[userId] || null;
    }

    const formatDate = (value: Date | string): string => {
      if (typeof value === "string") return value;
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throw new Error(`Неверный формат даты: ${String(value)}`);
      }
      return value.toISOString().substring(0, 10);
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
      if (startDate < new Date()) {
        searchResults.value = null;
        setLoading(false);
        isServerRequest.value = false;
        throw new Error(
          "Выбранные даты устарели. Пожалуйста, выберите новые даты.",
        );
      }
    }

    interface ApiRoomTariff {
      rate_plan_code: string;
      title: string;
      price: number;
      price_for_register?: number;
      packages?: TariffPackage[];
      has_food?: boolean;
      cancellation_free?: boolean;
      payment_types?: string[];
    }

    interface ApiRoomType {
      id?: number | string;
      room_type_code: string;
      title: string;
      description?: string | null;
      max_occupancy?: number;
      square?: number;
      rooms?: number;
      amenities?: RoomAmenity[];
      bed?: RoomBed | null;
      view?: RoomView | null;
      family?: RoomFamily | null;
      min_price?: number;
      price_for_register?: number;
      photos?: string[];
      tariffs?: ApiRoomTariff[];
    }

    interface ApiGroupedRoom {
      title: string;
      description: string | null;
      max_occupancy: number;
      square: number;
      rooms: number;
      amenities: RoomAmenity[];
      min_price: number;
      price_for_register?: number;
      photos: string[];
      room_type_codes: ApiRoomType[];
    }

    interface ApiUngroupedPayload {
      rooms: ApiRoomType[];
      packages?: PackageResource[];
      filters?: SearchResponse["filters"];
    }

    type ApiSearchPayload = ApiGroupedRoom[] | ApiUngroupedPayload | undefined;

    const ensureChildAges = (count: number, ages: number[]): number[] => {
      if (count === 0) return [0];
      if (ages.length === count) return ages;
      return Array.from({ length: count }, (_, index) => ages[index] ?? 0);
    };

    const mapTariffs = (tariffs?: ApiRoomTariff[]): RoomTariff[] => {
      if (!tariffs || tariffs.length === 0) return [];
      return tariffs.map((tariff) => ({
        rate_plan_code: tariff.rate_plan_code,
        title: tariff.title,
        price: tariff.price,
        price_for_register: tariff.price_for_register,
        packages: tariff.packages ?? [],
        has_food: tariff.has_food,
        cancellation_free: tariff.cancellation_free,
        payment_types: tariff.payment_types ?? [],
      }));
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
        min_price: room.min_price ?? group?.min_price ?? 0,
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

    const normalizeSearchPayload = (
      payload: ApiSearchPayload,
      groupedByBed: boolean,
    ): SearchResponse => {
      if (!payload) {
        return {
          available: false,
          rooms: [],
          packages: [],
          groupedByBed,
          rawPayload: payload,
        };
      }

      if (Array.isArray(payload)) {
        const rooms = payload.flatMap((group) =>
          (group.room_type_codes ?? []).map((room) => mapRoom(room, group)),
        );

        return {
          available: rooms.length > 0,
          rooms,
          packages: [],
          groupedByBed: true,
          rawPayload: payload,
        };
      }

      const rooms = (payload.rooms ?? []).map((room) => mapRoom(room));

      return {
        available: rooms.length > 0,
        rooms,
        packages: payload.packages ?? [],
        filters: payload.filters,
        groupedByBed,
        rawPayload: payload,
      };
    };

    function prepareSearchData(roomTypeCode?: string) {
      const [startDate, endDate] = date.value!;

      const list = guests.value.roomList ?? [];
      const totalAdults = list.reduce((sum, room) => sum + room.adults, 0);
      const guestsPayload = list.length
        ? list.map((room) => ({
            adults: room.adults,
            childs: ensureChildAges(room.children, room.childrenAges ?? []),
          }))
        : [
            {
              adults: totalAdults > 0 ? totalAdults : 1,
              childs: ensureChildAges(
                childrenAges.value.length,
                childrenAges.value,
              ),
            },
          ];

      const groupedByBed = guestsPayload.length === 1;

      const searchData: Record<string, unknown> = {
        start_at: formatDate(startDate),
        end_at: formatDate(endDate),
        promocode: promoCode.value || null,
        step: 1,
        grouped_by_bed: groupedByBed,
        room_type_code: roomTypeCode ?? null,
        guests: guestsPayload,
      };

      if (roomTypeCode) {
        searchData.with_packages = true;
      }

      return { searchData, groupedByBed };
    }

    function setSelectedRoomType(roomTypeCode: string) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    async function search(skipReset = false): Promise<SearchResponse> {
      validateSearchParams();
      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;

      try {
        const { post } = useApi();
        const { searchData, groupedByBed } = prepareSearchData();

        isServerRequest.value = true;
        const response = await post<ApiSearchPayload>("/search", searchData, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success) {
          const normalized = normalizeSearchPayload(
            response.payload,
            groupedByBed,
          );
          searchResults.value = normalized;
          roomTariffs.value = normalized.rooms;
          return normalized;
        }

        throw new Error(response.message || "Ошибка при поиске номеров");
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        if (!skipReset) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }
    }

    async function createBooking(bookingData: BookingData) {
      const { post } = useApi();

      setLoading(true, "Создаём бронирование...");

      try {
        const processedData = { ...bookingData };

        if (processedData.order?.start_at) {
          processedData.order.start_at = formatDate(
            processedData.order.start_at,
          );
        }
        if (processedData.order?.end_at) {
          processedData.order.end_at = formatDate(processedData.order.end_at);
        }

        isServerRequest.value = true;
        const response = await post<{ booking: unknown }>(
          "/v1/booking",
          processedData,
          { signal: AbortSignal.timeout(10000) },
        );

        if (response.success && response.payload) {
          return response.payload.booking;
        } else {
          throw new Error(response.message || "Ошибка при создании брони");
        }
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при бронировании";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
    }

    async function getBookingDetails(bookingId: string) {
      const { get } = useApi();

      setLoading(true, "Загружаем детали брони...");

      try {
        isServerRequest.value = true;
        const response = await get<{ booking: unknown }>(`/${bookingId}`, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success && response.payload) {
          return response.payload.booking;
        } else {
          throw new Error(
            response.message || "Ошибка при получении данных брони",
          );
        }
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке данных";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
    }

    async function searchWithRoomType(
      roomTypeCode: string,
    ): Promise<SearchResponse> {
      validateSearchParams();
      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;
      selectedRoomType.value = roomTypeCode;

      try {
        const { post } = useApi();
        const { searchData, groupedByBed } = prepareSearchData(roomTypeCode);

        isServerRequest.value = true;
        const response = await post<ApiSearchPayload>("/search", searchData, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success) {
          const normalized = normalizeSearchPayload(
            response.payload,
            groupedByBed,
          );
          searchResults.value = normalized;
          roomTariffs.value = normalized.rooms;
          return normalized;
        }

        throw new Error(response.message || "Ошибка при поиске номеров");
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
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
      childrenAges.value = [];
      selectedRoomType.value = null;
      roomTariffs.value = [];
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
      childrenAges,
      selectedRoomType,
      roomTariffs,
      loadingMessage,
      forceReset,
      updateChildrenAges,
      setSelectedRoomType,
      setLoading,
      search,
      createBooking,
      getBookingDetails,
      searchWithRoomType,
      formatDate,
      roomList,
      updateRoomList,
      userProfiles,
      saveUserProfile,
      getUserProfile,
    };
  },
  {
    persist: {
      key: "booking-store",
      paths: [
        "date",
        "guests",
        "promoCode",
        "childrenAges",
        "searchResults",
        "selectedRoomType",
        "roomTariffs",
        "roomList",
        "userProfiles",
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
          return JSON.stringify(serialized);
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
