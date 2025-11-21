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

export type { SearchResponse, BookingData, SearchFilters, SearchFilter };
