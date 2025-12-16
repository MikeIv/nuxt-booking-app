/**
 * Константы с информацией об отеле
 */
export interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
}

export const HOTEL_INFO: HotelInfo = {
  name: 'Многофункциональный гостиничный комплекс "Россия"',
  address: "109012,Россия, г. Москва, ул. Варварка, д.14, стр. 1, 2",
  phone: "+7 (495) 274-99-99",
  email: "mail@mail.ru",
  imageUrl: "/images/room/room-01.jpg",
} as const;
