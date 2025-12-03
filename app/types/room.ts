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

export interface RoomTariff {
  rate_plan_code: string;
  title: string;
  price: number;
  price_for_register?: number;
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
  family?: RoomFamily | null;
  min_price: number | null;
  price_for_register?: number;
  photos: string[];
  tariffs: RoomTariff[];
  group_title?: string;
  group_description?: string | null;
  room_type_codes?: Room[];
}
