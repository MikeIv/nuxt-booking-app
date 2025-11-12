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
  guests: {
    name: string;
    surname: string;
    middle_name: string | null;
    phone: string;
    email: string;
    country: string;
  }[];
  subscribe_newsletter: boolean;
  payment_method: string;
  for_self: boolean;
  order: {
    start_at: string;
    end_at: string;
    adults: number;
    childs: number[];
    promocode: string | null;
    room_type_code: string;
    rate_plan_code: string | null;
    packages: string[];
  };
  sms_confirmation: boolean;
  additional: {
    start_at: string | null;
    end_at: string | null;
    comment: string | null;
  };
}

export type { SearchResponse, BookingData, SearchFilters, SearchFilter };
