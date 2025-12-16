/**
 * Типы для компонентов деталей бронирования
 */

export interface BookingDetailsRoom {
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
}

export interface BookingDetailsOrder {
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
}

export interface BookingDetailsData {
  id: number;
  uuid: string;
  confirmation_number: string | null;
  status: string;
  order: BookingDetailsOrder;
  rooms: BookingDetailsRoom[];
  total_price: number;
}
