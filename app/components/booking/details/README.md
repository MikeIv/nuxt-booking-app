# Компоненты деталей бронирования

Этот каталог содержит декомпозированные компоненты для страницы деталей бронирования.

## Структура компонентов

### BookingDetailsHeader
**Файл:** `BookingDetailsHeader.vue`

Отображает:
- Номер бронирования
- QR-код
- Кнопки "Скачать подтверждение" и "Распечатать"

**Props:**
- `bookingNumber` - номер бронирования (string | number | null, optional)
- `pdfUrl` - URL PDF-файла подтверждения (string, optional)

**Events:**
- `download` - клик на кнопку скачивания
- `print` - клик на кнопку печати

---

### BookingDetailsManagement
**Файл:** `BookingDetailsManagement.vue`

Отображает кнопки управления бронированием.

**Events:**
- `change-dates` - изменить даты
- `change-room` - изменить номер
- `change-services` - изменить услуги
- `change-contacts` - изменить контакты

---

### BookingDetailsHotelInfo
**Файл:** `BookingDetailsHotelInfo.vue`

Отображает информацию о гостинице.

**Props:**
- `name` - название гостиницы (string, required)
- `address` - адрес (string, required)
- `phone` - телефон (string, required)
- `email` - email (string, required)
- `imageUrl` - URL изображения (string, optional, default: "/images/room/room-01.jpg")

---

### BookingDetailsRoomItem
**Файл:** `BookingDetailsRoomItem.vue`

Отображает детали одного номера (раскрывающийся блок).

**Props:**
- `room` - данные номера (BookingDetailsRoom, required)
- `index` - индекс номера (number, required)
- `isExpanded` - состояние раскрытия (boolean, required)

**Events:**
- `toggle` - переключение раскрытия/скрытия деталей

---

### BookingDetailsSummary
**Файл:** `BookingDetailsSummary.vue`

Отображает сводку бронирования: даты, список номеров, общую стоимость.

**Props:**
- `startDate` - дата заезда (string, optional)
- `endDate` - дата выезда (string, optional)
- `nights` - количество ночей (number, required)
- `rooms` - список номеров (BookingDetailsRoom[], optional)
- `totalPrice` - общая стоимость (number, required)

---

### BookingDetailsPersonalInfo
**Файл:** `BookingDetailsPersonalInfo.vue`

Отображает личную информацию гостя и детали заказа.

**Props:**
- `name` - имя (string, optional)
- `surname` - фамилия (string, optional)
- `nationality` - гражданство (string, optional)
- `phone` - телефон (string, optional)
- `email` - email (string, optional)
- `comment` - комментарий к бронированию (string | null, optional)
- `paymentMethod` - способ оплаты (string, optional)

---

### BookingDetailsActions
**Файл:** `BookingDetailsActions.vue`

Отображает финальные действия с бронированием.

**Events:**
- `cancel` - отменить бронирование
- `new-booking` - создать новое бронирование
- `back-to-cabinet` - вернуться в кабинет

---

## Типы

Типы для компонентов определены в `~/types/booking-details.ts`:

- `BookingDetailsRoom` - тип данных номера
- `BookingDetailsOrder` - тип данных заказа
- `BookingDetailsData` - полный тип данных бронирования

## Использование

Пример использования в главном компоненте `booking-details.vue`:

```vue
<template>
  <BookingDetailsHeader
    :booking-number="bookingNumber"
    :pdf-url="bookingDetails.order?.pdf"
    @download="handleDownload"
    @print="handlePrint"
  />
  
  <BookingDetailsSummary
    :start-date="bookingDetails.order?.start_at"
    :end-date="bookingDetails.order?.end_at"
    :nights="nights"
    :rooms="rooms"
    :total-price="totalPrice"
  />
</template>
```

## Преимущества декомпозиции

1. **Модульность** - каждый компонент отвечает за свою часть UI
2. **Переиспользование** - компоненты можно использовать в других частях приложения
3. **Тестируемость** - легче писать unit-тесты для отдельных компонентов
4. **Поддержка** - проще находить и исправлять ошибки
5. **Читаемость** - код главного компонента стал значительно короче (с 1146 до ~240 строк)

