export interface RoomAmenity {
  title: string;
}

export interface PackageResource {
  package_code: string;
  title: string;
  description: string | null;
  photos: string[];
  price: string;
  calculation_rate_title: string;
}

export interface TariffPackage {
  title: string;
  [key: string]: unknown;
}

export interface TariffGroup {
  id: number;
  title: string;
}

/** Цена тарифа для конкретного номера в мультибронировании */
export interface TariffRoomPrice {
  room_index: number;
  room_number: number;
  room_type_code: string;
  rate_plan_code: string;
  price: number;
  price_for_register?: number;
  packages?: string[];
}

export interface RoomTariff {
  rate_plan_code: string;
  title: string;
  price: number;
  price_for_register?: number;
  /** Цены по номерам (multi_booking_mode); при наличии — использовать вместо price для строк номеров */
  room_prices?: TariffRoomPrice[];
  packages: TariffPackage[];
  has_food?: boolean;
  cancellation_free?: boolean;
  payment_types?: string[];
  /** Описание тарифа (приходит из API) */
  description?: string | null;
  /** Данные для popover о бесплатной отмене */
  cancellation_popover?: {
    title?: string;
    description?: string;
  };
  /** Группа тарифа (Базовый, Предоплатный и т.д.) */
  group?: TariffGroup;
}

export interface RoomBed {
  id: number;
  title: string;
}

export interface RoomView {
  id: number;
  title: string;
}

export interface RoomFamily {
  id: number;
  title: string;
}

export interface BalconyResource {
  id: number;
  title: string;
}

// Алиасы для совместимости с API
export type BedResource = RoomBed;
export type ViewResource = RoomView;

export interface Room {
  id?: string | number;
  room_type_code: string;
  title: string;
  description: string | null;
  max_occupancy: number;
  square: number;
  rooms: number;
  amenities: RoomAmenity[];
  bed?: RoomBed | null;
  view?: RoomView | null;
  balcony?: BalconyResource | null;
  family?: RoomFamily | null;
  min_price: number | null;
  price_for_register?: number;
  photos: string[];
  tariffs: RoomTariff[];
  group_title?: string;
  group_description?: string | null;
  room_type_codes?: Room[];
}
