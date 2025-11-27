import type { PackageResource, Room, RoomBed, RoomView } from "./room";

interface SearchFilter<T = RoomBed | RoomView> {
  id: number;
  title: string;
  extra?: T;
}

interface SearchFilters {
  beds?: SearchFilter[];
  views?: SearchFilter[];
  balconies?: SearchFilter[];
}

interface SearchResponse {
  available: boolean;
  rooms: Room[];
  packages: PackageResource[];
  filters?: SearchFilters;
  groupedByBed: boolean;
  rawPayload?: unknown;
}

interface BookingData {
  for_self: boolean;
  start_at: string;
  end_at: string;
  payment: string;
  agreements: boolean;
  additional: {
    start_at: string | null;
    end_at: string | null;
    comment: string | null;
  };
  rooms: {
    room_type_code: string;
    rate_type_code: string;
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
}

interface BookingResponse {
  id: number;
  uuid: string;
  hotel: HotelInfo;
  order: OrderInfo;
  rooms: unknown[];
}

export type {
  SearchResponse,
  BookingData,
  BookingResponse,
  SearchFilters,
  SearchFilter,
};
