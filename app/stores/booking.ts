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
  BookingHistoryItem,
} from "~/types/booking";

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

export interface SelectedMultiRoomEntry {
  roomIdx: number;
  roomCardIdx: number;
  roomTitle: string;
  room_type_code: string;
  ratePlanCode: string;
  price: number | null | undefined;
  title: string;
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
    const currentBookingDetails = ref<BookingHistoryItem | null>(null);
    const packages = ref<PackageResource[]>([]);
    const selectedMultiRooms = ref<Record<string, SelectedMultiRoomEntry>>({});

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

    function setCurrentBookingDetails(booking: BookingHistoryItem | null) {
      currentBookingDetails.value = booking;
    }

    function setSelectedMultiRooms(
      rooms: Record<string, SelectedMultiRoomEntry>,
    ) {
      selectedMultiRooms.value = { ...rooms };
    }

    function clearSelectedMultiRooms() {
      selectedMultiRooms.value = {};
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
        [userId]: { ...profile },
      };
    }

    function getUserProfile(userId: number): UserProfileData | null {
      return userProfiles.value[userId] || null;
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

    interface ApiRoomTariff {
      rate_plan_code: string;
      title: string;
      price: number | string;
      price_for_register?: number;
      packages?: TariffPackage[];
      has_food?: boolean;
      cancellation_free?: boolean;
      cancellation_description?: string | null;
      payment_types?: string[];
      description?: string | null;
      cancellation_popover?: {
        title?: string;
        description?: string;
      };
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
      min_price?: number | string | null;
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
      min_price: number | string | null;
      price_for_register?: number;
      photos: string[];
      // Сервер может возвращать варианты как "beds" или "room_type_codes"
      beds?: ApiRoomType[];
      room_type_codes?: ApiRoomType[];
    }

    // Grouped формат с фильтрами (новый формат ответа)
    interface ApiGroupedPayload {
      rooms: ApiGroupedRoom[];
      filters: SearchResponse["filters"];
    }

    interface ApiUngroupedPayload {
      rooms: ApiRoomType[];
      packages?: PackageResource[];
      filters: SearchResponse["filters"];
    }

    // Новый формат ответа для тарифов конкретного номера
    interface ApiRoomTariffPayload {
      room: ApiRoomType;
      packages?: PackageResource[];
    }

    type ApiSearchPayload =
      | ApiGroupedRoom[]
      | ApiGroupedPayload
      | ApiUngroupedPayload
      | ApiRoomTariffPayload
      | undefined;

    const ensureChildAges = (count: number, ages: number[]): number[] => {
      if (count === 0) return [];
      if (ages.length === count) return ages;
      return Array.from({ length: count }, (_, index) => ages[index] ?? 0);
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
          packages: tariff.packages ?? [],
          has_food: tariff.has_food,
          cancellation_free: tariff.cancellation_free,
          payment_types: tariff.payment_types ?? [],
          // Используем cancellation_description, если description не указан
          description:
            tariff.description ?? tariff.cancellation_description ?? null,
          cancellation_popover,
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
          filters: {
            beds: [],
            views: [],
            balconies: [],
          },
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
          filters: {
            beds: [],
            views: [],
            balconies: [],
          },
          groupedByBed: false,
          rawPayload: payload,
        };
      }

      // Общая функция для обработки grouped rooms
      const processGroupedRooms = (
        groups: ApiGroupedRoom[],
        filters?: SearchResponse["filters"],
      ): SearchResponse => {
        const groupedRooms = new Map<string, Room>();

        groups.forEach((group, index) => {
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
            const normalizedRoomPrice = normalizeMinPrice(room.min_price);
            if (existing.min_price === null) {
              existing.min_price = normalizedRoomPrice;
            } else if (normalizedRoomPrice !== null) {
              existing.min_price = Math.min(
                existing.min_price,
                normalizedRoomPrice,
              );
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
          filters: filters ?? {
            beds: [],
            views: [],
            balconies: [],
          },
          groupedByBed: true,
          rawPayload: payload,
        };
      };

      // Обработка нового формата: объект с rooms и filters
      if (
        !Array.isArray(payload) &&
        "rooms" in payload &&
        Array.isArray(payload.rooms) &&
        "filters" in payload
      ) {
        // Проверяем, является ли это grouped форматом (есть beds или room_type_codes)
        // или ungrouped форматом (rooms уже финальные объекты с тарифами)
        // Для безопасности проверяем первый непустой элемент массива
        const firstRoom = payload.rooms.find(
          (room) => room !== null && room !== undefined,
        );

        // Если массив пустой, обрабатываем как ungrouped (безопасный fallback)
        if (!firstRoom) {
          const ungroupedPayload = payload as ApiUngroupedPayload;
          return {
            available: false,
            rooms: [],
            packages: ungroupedPayload.packages ?? [],
            filters: ungroupedPayload.filters ?? {
              beds: [],
              views: [],
              balconies: [],
            },
            groupedByBed: false,
            rawPayload: payload,
          };
        }

        const isGroupedFormat =
          "beds" in firstRoom || "room_type_codes" in firstRoom;

        if (isGroupedFormat) {
          // Это grouped формат - обрабатываем как группированные комнаты
          const groupedPayload = payload as ApiGroupedPayload;
          return processGroupedRooms(
            groupedPayload.rooms,
            groupedPayload.filters,
          );
        } else {
          // Это ungrouped формат - rooms уже финальные объекты с тарифами
          // Используется для мультибронирования (multi_booking_mode: true)
          const ungroupedPayload = payload as ApiUngroupedPayload;
          const rooms = (ungroupedPayload.rooms ?? []).map((room) =>
            mapRoom(room),
          );

          return {
            available: rooms.length > 0,
            rooms,
            packages: ungroupedPayload.packages ?? [],
            filters: ungroupedPayload.filters ?? {
              beds: [],
              views: [],
              balconies: [],
            },
            groupedByBed: false, // Для ungrouped формата всегда false
            rawPayload: payload,
          };
        }
      }

      if (Array.isArray(payload)) {
        return processGroupedRooms(payload);
      }

      // Обработка формата ApiUngroupedPayload
      const ungroupedPayload = payload as ApiUngroupedPayload;
      const rooms = (ungroupedPayload.rooms ?? []).map((room) => mapRoom(room));

      return {
        available: rooms.length > 0,
        rooms,
        packages: ungroupedPayload.packages ?? [],
        filters: ungroupedPayload.filters ?? {
          beds: [],
          views: [],
          balconies: [],
        },
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
            return [
              {
                adults: room.adults,
                childs: ensureChildAges(room.children, room.childrenAges ?? []),
              },
            ];
          })()
        : list.map((room) => ({
            adults: room.adults,
            childs: ensureChildAges(room.children, room.childrenAges ?? []),
          }));

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

    function setSelectedRoomType(roomTypeCode: string) {
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
      selectedTariff.value = room.tariffs?.[0] ?? null;
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

      try {
        const { post } = useApi();
        const { searchData, groupedByBed } = prepareSearchData(roomTypeCode);
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

    async function getBookingDetails(bookingId: string | number) {
      const { get } = useApi();

      setLoading(true, "Загружаем детали брони...");

      try {
        isServerRequest.value = true;
        const response = await get<BookingHistoryItem>(
          `/v1/users/bookings/${bookingId}`,
          {},
          {
            signal: AbortSignal.timeout(10000),
          },
        );

        if (response.success && response.payload) {
          const bookingDetails = response.payload;
          setCurrentBookingDetails(bookingDetails);
          return bookingDetails;
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

    async function searchPackages(
      roomIndex?: number,
    ): Promise<PackageResource[]> {
      validateSearchParams();
      error.value = null;

      try {
        const { post } = useApi();

        const multiRoomsEntries = Object.values(selectedMultiRooms.value);
        const isMultiRoom = multiRoomsEntries.length > 0;

        // Для мультибронирования: запрос по одному номеру (по индексу вкладки)
        const effectiveRoomIndex = isMultiRoom ? (roomIndex ?? 0) : undefined;
        let roomTypeCode: string | undefined;
        let ratePlanCode: string | undefined;

        if (isMultiRoom) {
          const entry = multiRoomsEntries[effectiveRoomIndex!];
          roomTypeCode =
            entry?.room_type_code?.trim() !== ""
              ? entry?.room_type_code
              : undefined;
          ratePlanCode = entry?.ratePlanCode;
        } else {
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

        throw new Error(response.message || "Ошибка при получении услуг");
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке услуг";
        packages.value = [];
        throw err;
      } finally {
        isServerRequest.value = false;
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
      selectedRoomType.value = null;
      roomTariffs.value = [];
      selectedServicesByRoom.value = {};
      createdBooking.value = null;
      currentBookingDetails.value = null;
      selectedMultiRooms.value = {};
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
      formatDate,
      userProfiles,
      saveUserProfile,
      getUserProfile,
      selectedServices,
      selectedServicesByRoom,
      addService,
      removeService,
      isServiceSelected,
      getSelectedServicesForRoom,
      createdBooking,
      currentBookingDetails,
      setCurrentBookingDetails,
      packages,
      searchPackages,
      selectedMultiRooms,
      setSelectedMultiRooms,
      clearSelectedMultiRooms,
    };
  },
  {
    persist: {
      key: "booking-store",
      paths: [
        "date",
        "guests",
        "promoCode",
        "searchResults",
        "selectedRoomType",
        "selectedTariff",
        "roomTariffs",
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
