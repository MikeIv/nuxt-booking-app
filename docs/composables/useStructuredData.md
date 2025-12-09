# useStructuredData

Composable для генерации структурированных данных (JSON-LD) по стандарту Schema.org.

## Описание

`useStructuredData` предоставляет современный способ добавления структурированных данных на страницы для улучшения SEO. Использует формат JSON-LD, рекомендованный Google, вместо устаревших HTML-микроданных (itemscope, itemtype, itemprop).

## Преимущества JSON-LD

- ✅ **Современный стандарт** - рекомендуется Google и другими поисковиками
- ✅ **Чистый HTML** - не засоряет разметку атрибутами микроданных
- ✅ **Легкая поддержка** - структурированные данные отделены от представления
- ✅ **Нет предупреждений IDE** - не использует deprecated атрибуты
- ✅ **Типобезопасность** - полная типизация TypeScript

## API

### `generateHotelRoomSchema(room, images?)`

Генерирует JSON-LD разметку для номера отеля.

**Параметры:**
- `room: Room` - данные о номере
- `images?: string[]` - массив URL изображений (опционально)

**Возвращает:** Объект структурированных данных в формате Schema.org HotelRoom

### `setStructuredData(schema)`

Вставляет JSON-LD script в `<head>` страницы через `useHead`.

**Параметры:**
- `schema: HotelRoomStructuredData` - объект структурированных данных

## Пример использования

```typescript
<script setup lang="ts">
import { useStructuredData } from "~/composables/useStructuredData";
import type { Room } from "~/types/room";

const props = defineProps<{ room: Room }>();
const { generateHotelRoomSchema, setStructuredData } = useStructuredData();

// Генерация и установка структурированных данных
watch(
  () => props.room,
  (room) => {
    const images = room.photos || [];
    const schema = generateHotelRoomSchema(room, images);
    setStructuredData(schema);
  },
  { immediate: true }
);
</script>
```

## Генерируемая структура

Пример JSON-LD, который будет добавлен в `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "HotelRoom",
  "name": "Люкс с видом на море",
  "occupancy": {
    "@type": "QuantitativeValue",
    "minValue": 1,
    "maxValue": 4
  },
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": 45,
    "unitText": "квадратный метр",
    "unitCode": "MTK"
  },
  "image": [
    "https://example.com/room1.jpg",
    "https://example.com/room2.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "price": 5000,
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock"
  }
}
```

## Интеграция в компоненты

В компоненте `booking/Card.vue` composable используется для автоматической генерации структурированных данных при изменении номера или изображений:

```typescript
// Автоматическая генерация при изменении данных
watch(
  [currentRoom, carouselImages],
  ([room, images]) => {
    const imageUrls = images.filter((img): img is string => typeof img === "string");
    const schema = generateHotelRoomSchema(room, imageUrls);
    setStructuredData(schema);
  },
  { immediate: true }
);
```

## Проверка результата

После внедрения можно проверить структурированные данные:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **DevTools**: Проверить наличие `<script type="application/ld+json">` в `<head>`

## Расширение

Для добавления других типов структурированных данных (например, Hotel, Event, Product) можно расширить composable:

```typescript
const generateHotelSchema = (hotel: Hotel) => {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    address: hotel.address,
    // ...
  };
};
```

## Ссылки

- [Schema.org HotelRoom](https://schema.org/HotelRoom)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [JSON-LD Specification](https://json-ld.org/)

