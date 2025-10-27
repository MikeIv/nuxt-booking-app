import type { PackageResource, Room } from "./room";

interface Bed {
  id: number;
  title: string;
}

interface SearchResponse {
  available: boolean;
  rooms?: Room[];
  totalPrice?: number;
  message?: string;
  packages?: PackageResource[];
  filters?: { beds?: Bed[] };
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

export type { Bed, SearchResponse, BookingData };
