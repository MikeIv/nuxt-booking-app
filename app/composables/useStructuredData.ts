import type { Room } from "~/types/room";

/**
 * Структура JSON-LD для номера отеля по стандарту Schema.org
 * @see https://schema.org/HotelRoom
 */
export interface HotelRoomStructuredData {
  "@context": "https://schema.org";
  "@type": "HotelRoom";
  name: string;
  occupancy?: {
    "@type": "QuantitativeValue";
    minValue: number;
    maxValue: number;
  };
  floorSize?: {
    "@type": "QuantitativeValue";
    value: number;
    unitText: string;
    unitCode: string;
  };
  image?: string[];
  offers?: {
    "@type": "Offer";
    price: number;
    priceCurrency: "RUB";
    availability?: "https://schema.org/InStock";
  };
}

/**
 * Composable для генерации структурированных данных (JSON-LD) по стандарту Schema.org
 * Используется для улучшения SEO и отображения в поисковых системах
 */
export function useStructuredData() {
  /**
   * Генерирует JSON-LD разметку для номера отеля
   * @param room - Данные о номере
   * @param images - Массив URL изображений номера
   * @returns Объект структурированных данных в формате Schema.org HotelRoom
   */
  const generateHotelRoomSchema = (
    room: Room,
    images: string[] = [],
  ): HotelRoomStructuredData => {
    const schema: HotelRoomStructuredData = {
      "@context": "https://schema.org",
      "@type": "HotelRoom",
      name: room.title,
    };

    // Добавляем данные о вместимости
    if (room.max_occupancy) {
      schema.occupancy = {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: room.max_occupancy,
      };
    }

    // Добавляем площадь номера
    if (room.square) {
      schema.floorSize = {
        "@type": "QuantitativeValue",
        value: room.square,
        unitText: "квадратный метр",
        unitCode: "MTK", // UN/CEFACT код для квадратных метров
      };
    }

    // Добавляем изображения
    if (images.length > 0) {
      schema.image = images;
    }

    // Добавляем информацию о цене
    if (room.min_price !== null && room.min_price !== undefined) {
      schema.offers = {
        "@type": "Offer",
        price: room.min_price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      };
    }

    return schema;
  };

  /**
   * Вставляет JSON-LD script в head страницы
   * Использует useHead из Nuxt для управления тегами в head
   * @param schema - Объект структурированных данных
   */
  const setStructuredData = (schema: HotelRoomStructuredData) => {
    useHead({
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify(schema),
        },
      ],
    });
  };

  return {
    generateHotelRoomSchema,
    setStructuredData,
  };
}
