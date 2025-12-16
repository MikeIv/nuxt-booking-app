import type {
  PackageResource,
  Room,
  BedResource,
  ViewResource,
  BalconyResource,
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
  phone?: string;
}

interface BookingResponse {
  id: number;
  uuid: string;
  hotel: HotelInfo;
  order: OrderInfo;
  rooms: unknown[];
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

export type {
  SearchResponse,
  BookingData,
  BookingResponse,
  SearchFilters,
  BookingHistoryItem,
  BookingHistoryResponse,
};
