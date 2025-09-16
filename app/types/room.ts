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

export interface RoomTariff {
  rate_plan_code: string;
  title: string;
  price: number;
  packages: PackageResource[];
}

export interface Room {
  id?: number;
  room_type_code: string;
  title: string;
  description: string;
  max_occupancy: number;
  square: number;
  rooms: number;
  amenities: RoomAmenity[];
  bed: string | null;
  min_price: number;
  photos: string[];
  tariffs: RoomTariff[];
}
