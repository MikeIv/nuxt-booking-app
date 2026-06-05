import type {
  PackageResource,
  Room,
  BedResource,
  ViewResource,
  BalconyResource,
  TariffPackage,
  TariffGroup,
  RoomAmenity,
  RoomBed,
  RoomView,
  RoomFamily,
} from "./room";

interface SearchFilters {
  beds: BedResource[];
  views: ViewResource[];
  balconies: BalconyResource[];
}

interface SearchResponse {
  available: boolean;
  rooms: Room[];
  packages: PackageResource[];
  filters: SearchFilters;
  groupedByBed: boolean;
  /** Группы тарифов для фильтрации (при grouped: true в запросе) */
  tariffGroups?: TariffGroup[];
  rawPayload?: unknown;
}

interface BookingData {
  for_self: boolean;
  start_at: string;
  end_at: string;
  adults: number;
  children: number;
  payment: string;
  agreements: boolean;
  children_ages: number[];
  additional: {
    start_at: string | null;
    end_at: string | null;
    comment: string | null;
  };
  rooms: {
    room_type_code: string;
    rate_type_code: string;
    packages?: string[];
    adults?: number;
    children?: number;
    children_ages?: number[];
    guests: {
      surname: string;
      name: string;
      middle_name: string | null;
      phone: string;
      email: string;
      nationality: string;
      sms_confirmation: boolean;
      email_subscribe: boolean;
    }[];
  }[];
}

interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface OrderInfo {
  start_at: string;
  end_at: string;
  nights: number;
  phone?: string;
  pdf?: string;
}

/** Payload ответа GET /v1/booking/{uuid} (после редиректа с оплаты) */
export interface BookingByUuidOrder {
  name: string;
  surname: string;
  nationality: string;
  comment: string;
  payment_cancelled: string;
  start_at: string;
  end_at: string;
  nights: string;
  pdf: string;
}

export interface BookingByUuidPayment {
  init_url: string;
  guarantee_type: string;
  amount: number;
}

/** Элемент rooms в ответе GET /v1/booking/{uuid} (совместим с отображением на confirmation) */
export interface BookingByUuidRoom {
  id?: number;
  title: string;
  square?: number;
  tariff: { title: string; price: string | number };
  guests?: Array<{
    surname: string;
    name: string;
    middle_name?: string | null;
    phone?: string;
    email?: string;
    is_main?: boolean;
  }>;
  adults?: number;
  children?: number;
  total_guests?: number;
  services?: unknown[];
  total: number;
}

/** Статус бронирования после оплаты (GET /v1/booking/{uuid}) */
export type BookingStatus = "processing" | "confirmed" | "failed";

export interface BookingByUuidPayload {
  id: string;
  uuid: string;
  number: string;
  confirmation_number?: string;
  status: BookingStatus | string;
  allowed?: Array<
    | "edit-dates"
    | "edit-number"
    | "edit-packages"
    | "edit-contacts"
    | "cancel"
    | null
  >;
  order: BookingByUuidOrder;
  /** Может прийти массивом или JSON-строкой */
  rooms: BookingByUuidRoom[] | string;
  total_price: number;
  payment: BookingByUuidPayment | BookingByUuidPayment[] | null;
  hotel?: HotelInfo;
}

interface BookingResponse {
  id?: number | string;
  uuid?: string;
  number?: string;
  confirmation_number?: string;
  status?: string;
  allowed?: Array<
    "edit-dates" | "edit-number" | "edit-packages" | "edit-contacts" | "cancel"
  >;
  hotel?: HotelInfo;
  order?: OrderInfo & Partial<BookingByUuidOrder>;
  rooms?: unknown[];
  total_price?: number;
  payment?: BookingByUuidPayment | BookingByUuidPayment[] | null;
  /** URL для перенаправления на страницу оплаты */
  redirect_url?: string;
}

// История бронирований
interface BookingHistoryItem {
  id: string | number;
  uuid?: string;
  confirmation_number: string | null;
  status: string;
  order: {
    name: string;
    surname: string;
    nationality: string;
    phone?: string;
    comment: string | null;
    payment_method: string;
    payment_cancelled: string;
    start_at: string;
    end_at: string;
    nights: number;
    pdf: string;
  };
  rooms: Array<{
    id: number;
    title: string;
    tariff: {
      title: string;
      price: string | number;
    };
    guests: {
      main: {
        name: string;
        surname: string;
        email: string;
        phone?: string;
      };
      adults: number;
      children: number;
      total: number;
    };
    services: string[];
    total: number;
  }>;
  total_price: number;
}

interface BookingHistoryResponse {
  success: boolean;
  message: string;
  payload: BookingHistoryItem[];
}

/** Тело POST /v1/search/upgrade */
export interface SearchUpgradeRequest {
  room_type_code: string;
  rate_plan_code: string;
  promocode: string | null;
  start_at: string;
  end_at: string;
  guests: {
    adults: number;
    childs: number[] | null;
  };
}

/** Элемент массива payload.rooms в ответе POST /v1/search/upgrade */
export interface SearchUpgradeRoomItem {
  room_type_code: string;
  title: string;
  description: string | null;
  max_occupancy: number;
  square: number;
  rooms: number;
  amenities: Array<{ title: string }>;
  bed: { id: number; title: string } | null;
  view: { id: number; title: string } | null;
  balcony: { id: number; title: string } | null;
  family: { id: number; title: string; level?: number } | null;
  min_price: string;
  price_for_register?: number;
  photos: string[];
  tariffs: Array<{
    rate_plan_code: string;
    title: string;
    price: string;
    price_for_register?: number;
    packages: string[];
    has_food?: boolean;
    cancellation_free?: boolean;
    cancellation_description?: string | null;
    payment_types?: string[];
    group?: {
      id: number;
      title: string;
      created_at?: string;
      updated_at?: string;
    };
  }>;
}

/** Ответ API: payload для POST /v1/search/upgrade (новая структура) */
export interface SearchUpgradePayload {
  rooms: SearchUpgradeRoomItem[];
  packages: unknown[];
  availability: unknown;
}

/** Форма контактных данных при изменении бронирования */
export type ContactFormData = {
  name: string;
  surname: string;
  middle_name: string;
  phone: string;
  email: string;
  country: string;
};

/** Выбранный номер/тариф для корзины и сводки бронирования */
export interface SelectedEntry {
  roomIdx: number;
  roomCardIdx: number;
  roomTitle: string;
  room_type_code: string;
  ratePlanCode: string;
  /** Цена за 1 ночь (не итог за период из API search) */
  price: number | null | undefined;
  title: string;
  /** Площадь номера, м² (ключ square в API) */
  square?: number;
}

/** API-типы ответа поиска (сырые данные от сервера, до маппинга) */

export interface ApiTariffRoomPrice {
  room_index: number | string;
  room_number: number;
  room_type_code: string;
  rate_plan_code: string;
  price: number | string;
  price_for_register?: number;
  packages?: string[];
}

export interface ApiRoomTariff {
  rate_plan_code: string;
  title: string;
  price: number | string;
  price_for_register?: number;
  room_prices?: ApiTariffRoomPrice[];
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

export interface ApiRoomType {
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

export interface ApiGroupedRoom {
  title: string;
  description: string | null;
  max_occupancy: number;
  square: number;
  rooms: number;
  amenities: RoomAmenity[];
  min_price: number | string | null;
  price_for_register?: number;
  photos: string[];
  /** Сервер может возвращать варианты как "beds" или "room_type_codes" */
  beds?: ApiRoomType[];
  room_type_codes?: ApiRoomType[];
}

export interface ApiGroupedPayload {
  rooms: ApiGroupedRoom[];
  filters: SearchFilters;
}

export interface ApiUngroupedPayload {
  rooms: ApiRoomType[];
  packages?: PackageResource[];
  filters: SearchFilters;
  tariff_groups?: TariffGroup[];
}

export interface ApiRoomTariffPayload {
  room: ApiRoomType;
  packages?: PackageResource[];
  tariff_groups?: TariffGroup[];
}

export type ApiSearchPayload =
  | ApiGroupedRoom[]
  | ApiGroupedPayload
  | ApiUngroupedPayload
  | ApiRoomTariffPayload
  | undefined;

export type {
  SearchResponse,
  BookingData,
  BookingResponse,
  SearchFilters,
  BookingHistoryItem,
  BookingHistoryResponse,
};
