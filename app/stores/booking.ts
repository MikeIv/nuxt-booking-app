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
import type {
  SearchResponse,
  BookingData,
  BookingResponse,
} from "~/types/booking";

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

export interface SelectedService {
  id: number;
  title: string;
  price: number;
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
    const selectedTariff = ref<RoomTariff | null>(null);
    const roomTariffs = ref<Room[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");
    const roomList = ref<GuestInfo[]>([]);
    const userProfiles = ref<Record<string, UserProfileData>>({});

    const selectedServices = ref<SelectedService[]>([]);
    const createdBooking = ref<BookingResponse | null>(null);

    function addService(service: SelectedService) {
      if (!selectedServices.value.find((s) => s.id === service.id)) {
        selectedServices.value.push(service);
      }
    }

    function removeService(serviceId: number) {
      const index = selectedServices.value.findIndex((s) => s.id === serviceId);
      if (index !== -1) {
        selectedServices.value.splice(index, 1);
      }
    }

    function isServiceSelected(serviceId: number): boolean {
      return selectedServices.value.some((s) => s.id === serviceId);
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
      price: number | string; // Может приходить как строка из API
      price_for_register?: number;
      packages?: TariffPackage[];
      has_food?: boolean;
      cancellation_free?: boolean;
      cancellation_description?: string | null; // Описание отмены может приходить отдельно
      payment_types?: string[];
      description?: string | null;
      group?: {
        id: number;
        title: string;
        created_at?: string;
        updated_at?: string;
      };
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
      min_price?: number | string | null; // Может приходить как строка из API
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
      min_price: number | string | null; // Может приходить как строка из API
      price_for_register?: number;
      photos: string[];
      // Сервер может возвращать варианты как "beds" или "room_type_codes"
      beds?: ApiRoomType[];
      room_type_codes?: ApiRoomType[];
    }

    interface ApiUngroupedPayload {
      rooms: ApiRoomType[];
      packages?: PackageResource[];
      filters?: SearchResponse["filters"];
    }

    // Новый формат ответа для тарифов конкретного номера
    interface ApiRoomTariffPayload {
      room: ApiRoomType;
      packages?: PackageResource[];
    }

    type ApiSearchPayload =
      | ApiGroupedRoom[]
      | ApiUngroupedPayload
      | ApiRoomTariffPayload
      | undefined;

    const ensureChildAges = (count: number, ages: number[]): number[] => {
      if (count === 0) return [];
      if (ages.length === count) return ages;
      return Array.from({ length: count }, (_, index) => ages[index] ?? 0);
    };

    const mapTariffs = (tariffs?: ApiRoomTariff[]): RoomTariff[] => {
      if (!tariffs || tariffs.length === 0) return [];
      return tariffs.map((tariff) => ({
        rate_plan_code: tariff.rate_plan_code,
        title: tariff.title,
        price:
          typeof tariff.price === "string"
            ? Number(tariff.price)
            : tariff.price,
        price_for_register: tariff.price_for_register,
        packages: tariff.packages ?? [],
        has_food: tariff.has_food,
        cancellation_free: tariff.cancellation_free,
        payment_types: tariff.payment_types ?? [],
        // Используем cancellation_description, если description не указан
        description:
          tariff.description ?? tariff.cancellation_description ?? null,
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
        min_price: (() => {
          const price = room.min_price ?? group?.min_price ?? null;
          if (price === null || price === undefined) return null;
          return typeof price === "string" ? Number(price) : price;
        })(),
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

      // Критически важно: room_type_code должен быть кодом, а не названием
      // Используем код из первого варианта, если он есть и валидный
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
      // Тарифы могут быть в любом варианте, поэтому собираем из всех
      const tariffsSet = new Map<string, RoomTariff>();
      variants.forEach((variant) => {
        if (variant.tariffs && variant.tariffs.length > 0) {
          variant.tariffs.forEach((tariff) => {
            // Используем rate_plan_code как уникальный ключ
            if (!tariffsSet.has(tariff.rate_plan_code)) {
              tariffsSet.set(tariff.rate_plan_code, tariff);
            }
          });
        }
      });
      const allTariffs = Array.from(tariffsSet.values());

      const baseRoom: Room = {
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
        min_price: (() => {
          const price = group.min_price ?? primaryVariant?.min_price ?? null;
          if (price === null || price === undefined) return null;
          return typeof price === "string" ? Number(price) : price;
        })(),
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
      };

      return baseRoom;
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

      // Обработка нового формата: payload.room с тарифами
      if (!Array.isArray(payload) && "room" in payload && payload.room) {
        const roomPayload = payload as ApiRoomTariffPayload;
        const room = mapRoom(roomPayload.room);
        return {
          available: true,
          rooms: [room],
          packages: roomPayload.packages ?? [],
          groupedByBed: false,
          rawPayload: payload,
        };
      }

      if (Array.isArray(payload)) {
        const groupedRooms = new Map<string, Room>();

        payload.forEach((group, index) => {
          const room = mapGroupedRoom(group);

          // Сервер может возвращать варианты как "beds" или "room_type_codes"
          const firstVariant = group.beds?.[0] ?? group.room_type_codes?.[0];
          const key =
            firstVariant?.family?.id?.toString() ??
            firstVariant?.family?.title ??
            group.title ??
            room.room_type_code ??
            `group-${index}`;

          const existing = groupedRooms.get(key);

          if (existing) {
            const existingVariants = existing.room_type_codes ?? [];
            const newVariants = room.room_type_codes ?? [];

            const variantMap = new Map<string, Room>();

            existingVariants.forEach((variant, variantIndex) => {
              const variantKey =
                variant.room_type_code ??
                (typeof variant.id === "string"
                  ? variant.id
                  : variant.id?.toString()) ??
                `variant-${key}-${variantIndex}`;
              variantMap.set(variantKey, variant);
            });

            newVariants.forEach((variant, variantIndex) => {
              const variantKey =
                variant.room_type_code ??
                (typeof variant.id === "string"
                  ? variant.id
                  : variant.id?.toString()) ??
                `variant-${key}-new-${variantIndex}`;
              variantMap.set(variantKey, variant);
            });

            existing.room_type_codes = Array.from(variantMap.values());

            // Обновляем min_price с учетом null значений
            if (existing.min_price === null) {
              existing.min_price = room.min_price;
            } else if (room.min_price !== null) {
              existing.min_price = Math.min(existing.min_price, room.min_price);
            }

            if (
              existing.price_for_register === undefined ||
              (room.price_for_register !== undefined &&
                room.price_for_register < existing.price_for_register)
            ) {
              existing.price_for_register = room.price_for_register;
            }

            if (
              (!existing.photos || existing.photos.length === 0) &&
              room.photos &&
              room.photos.length > 0
            ) {
              existing.photos = room.photos;
            }

            if (
              (!existing.amenities || existing.amenities.length === 0) &&
              room.amenities &&
              room.amenities.length > 0
            ) {
              existing.amenities = room.amenities;
            }
          } else {
            groupedRooms.set(key, room);
          }
        });

        const rooms = Array.from(groupedRooms.values());

        return {
          available: rooms.length > 0,
          rooms,
          packages: [],
          groupedByBed: true,
          rawPayload: payload,
        };
      }

      // Обработка формата ApiUngroupedPayload
      const ungroupedPayload = payload as ApiUngroupedPayload;
      const rooms = (ungroupedPayload.rooms ?? []).map((room) => mapRoom(room));

      return {
        available: rooms.length > 0,
        rooms,
        packages: ungroupedPayload.packages ?? [],
        filters: ungroupedPayload.filters,
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
      const multiBookingMode = guestsPayload.length > 1;

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
        const response = await post<ApiSearchPayload>(
          "/v1/search",
          searchData,
          {
            signal: AbortSignal.timeout(10000),
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
        // Данные уже отформатированы в personal.vue, но убеждаемся в правильном формате
        const processedData: BookingData = {
          ...bookingData,
          // Убеждаемся, что даты в формате YYYY-MM-DD
          start_at: bookingData.start_at
            ? typeof bookingData.start_at === "string"
              ? bookingData.start_at
              : formatDate(bookingData.start_at)
            : "",
          end_at: bookingData.end_at
            ? typeof bookingData.end_at === "string"
              ? bookingData.end_at
              : formatDate(bookingData.end_at)
            : "",
          // Очищаем additional от null значений, если они не нужны
          additional: {
            start_at: bookingData.additional.start_at || null,
            end_at: bookingData.additional.end_at || null,
            comment: bookingData.additional.comment || null,
          },
        };

        // Логируем данные для отладки
        if (import.meta?.env?.DEV) {
          console.log(
            "📤 Отправка данных бронирования:",
            JSON.stringify(processedData, null, 2),
          );
        }

        isServerRequest.value = true;
        const response = await post<BookingResponse>(
          "/v1/booking",
          processedData,
          { signal: AbortSignal.timeout(10000) },
        );

        if (response.success && response.payload) {
          createdBooking.value = response.payload;
          return response.payload;
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
        const response = await get<{ booking: unknown }>(`/v1/${bookingId}`, {
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
        const response = await post<ApiSearchPayload>(
          "/v1/search",
          searchData,
          {
            signal: AbortSignal.timeout(10000),
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
      selectedServices.value = [];
      createdBooking.value = null;
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
      selectedTariff,
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
      selectedServices,
      addService,
      removeService,
      isServiceSelected,
      createdBooking,
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
        "selectedTariff",
        "roomTariffs",
        "roomList",
        "userProfiles",
        "selectedServices",
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
