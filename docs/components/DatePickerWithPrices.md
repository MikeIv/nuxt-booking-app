# DatePickerWithPrices.vue

## Описание

Компонент `DatePickerWithPrices.vue` представляет собой календарь выбора дат заезда и выезда с отображением цен на каждую дату. Компонент поддерживает выбор диапазона дат, навигацию по месяцам, загрузку цен через API и отображение состояния загрузки. Компонент оптимизирован для производительности с использованием мемоизации и shallow refs.

## Расположение

```
app/components/core/DatePickerWithPrices.vue
```

## Зависимости

### Props

- **`modelValue`** (`[Date, Date] | null`) - выбранный диапазон дат (заезд и выезд)

### Events

- **`update:modelValue`** - событие обновления выбранного диапазона дат
  - Параметры: `[Date, Date] | null`

### Composables

- **`useCalendarPrices()`** (`~/composables/useCalendarPrices`) - для загрузки и получения цен на даты
  - Используемые методы:
    - `fetchCalendarPrices(month: number, year: number)` - загрузка цен для месяца
    - `getPriceForDate(date: Date)` - получение цены для конкретной даты
    - `formatPrice(price: number)` - форматирование цены в строку
  - Используемые свойства:
    - `loading` - состояние загрузки цен

- **`useDateLocale()`** (`~/composables/useDateLocale`) - для локализованных названий месяцев и дней недели
  - Используемые свойства:
    - `monthNames` - массив названий месяцев
    - `weekDays` - массив названий дней недели
  - Используемые методы:
    - `formatDate(date: Date)` - форматирование даты с учетом локали

- **`useI18n()`** - для интернационализации (vue-i18n)
  - Используемые ключи:
    - `datepicker.checkInOut` - "Заезд — выезд"
    - `datepicker.selectDates` - "Выберите даты"
    - `datepicker.cancel` - "Отмена"
    - `datepicker.select` - "Выбрать"

### Компоненты

- **`CoreDatePickerInput`** - компонент поля ввода для отображения выбранных дат
- **`CoreCalendarHeader`** - заголовок календаря с навигацией по месяцам
- **`CoreCalendarGrid`** - сетка календаря с днями
- **`CoreCalendarFooter`** - футер календаря с кнопками действий

### Типы

Компонент использует стандартные типы TypeScript для работы с датами.

## Структура компонента

### Script Setup

Компонент использует Composition API с `<script setup>`.

#### Реактивные данные

- `currentMonth` (`shallowRef<number>`) - текущий отображаемый месяц (1-12)
- `currentYear` (`shallowRef<number>`) - текущий отображаемый год
- `selectedStartDate` (`ref<Date | null>`) - выбранная дата заезда
- `selectedEndDate` (`ref<Date | null>`) - выбранная дата выезда
- `isOpen` (`ref<boolean>`) - состояние открытия/закрытия календаря

#### Computed свойства

##### `value: [Date, Date] | null`

Двустороннее связывание с `modelValue` через `v-model`.

**Геттер:** возвращает `props.modelValue`

**Сеттер:** эмитит `update:modelValue` с новым значением

##### `displayValue: string`

Форматированное отображение выбранного диапазона дат.

**Возвращает:**
- Строку вида "ДД.ММ.ГГГГ - ДД.ММ.ГГГГ" если выбраны обе даты
- Пустую строку если даты не выбраны

##### `currentMonthYearLabel: string`

Метка текущего месяца и года для отображения в календаре.

**Формат:** "{Название месяца} {Год}"

##### `currentMonthName: string`

Название текущего месяца.

##### `calendarDays: Array<Day>`

Массив объектов дней для отображения в календаре.

**Структура объекта дня:**
```typescript
{
  date: Date;              // Дата без времени
  day: number;              // Число дня
  isCurrentMonth: boolean;  // Принадлежит ли текущему месяцу
  isToday: boolean;         // Является ли сегодняшним днем
  isStartDate: boolean;     // Является ли датой заезда
  isEndDate: boolean;        // Является ли датой выезда
  isInRange: boolean;       // Находится ли в выбранном диапазоне
  isPast: boolean;          // Прошедшая дата
  price: number | null;     // Цена на дату
  key: string;              // Уникальный ключ для оптимизации рендеринга
}
```

**Алгоритм генерации:**
1. Добавляются дни предыдущего месяца для заполнения первой недели
2. Добавляются все дни текущего месяца
3. Добавляются дни следующего месяца до заполнения 35 дней (5 недель)

##### `canGoToPrevMonth: boolean`

Проверяет, можно ли перейти к предыдущему месяцу (нельзя, если текущий месяц - текущий месяц года).

#### Мемоизированные функции

##### `getPrevMonth(month: number, year: number): [number, number]`

Вычисляет предыдущий месяц и год.

**Возвращает:** `[месяц, год]`

##### `getNextMonth(month: number, year: number): [number, number]`

Вычисляет следующий месяц и год.

**Возвращает:** `[месяц, год]`

##### `formatDateForDateTime(date: Date): string`

Форматирует дату для атрибута `datetime` в формате ISO (YYYY-MM-DD).

##### `getMonthName(monthIndex: number): string`

Получает название месяца по индексу (0-11).

##### `createDateOnly(year: number, month: number, day: number): Date`

Создает дату без времени (часы, минуты, секунды, миллисекунды = 0).

#### Методы

##### `loadPricesForVisibleMonths(): Promise<void>`

Асинхронно загружает цены для текущего, предыдущего и следующего месяцев.

**Алгоритм:**
1. Вычисляет предыдущий и следующий месяцы
2. Параллельно загружает цены для всех трех месяцев через `Promise.all`

##### `handleDateClick(day: Day): void`

Обрабатывает клик по дню календаря.

**Алгоритм:**
1. Если дата прошедшая (`isPast`), игнорирует клик
2. Если нет выбранной начальной даты или обе даты выбраны:
   - Устанавливает начальную дату
   - Сбрасывает конечную дату
   - Сбрасывает `value`
3. Если есть только начальная дата:
   - Если кликнули дату раньше начальной: меняет местами (новая дата становится начальной)
   - Иначе: устанавливает конечную дату
   - Обновляет `value` если обе даты выбраны

##### `prevMonth(): void`

Переходит к предыдущему месяцу.

**Ограничения:** Не позволяет перейти к месяцу раньше текущего месяца года.

##### `nextMonth(): void`

Переходит к следующему месяцу.

##### `toggleCalendar(): void`

Переключает состояние открытия/закрытия календаря.

##### `closeCalendar(): void`

Закрывает календарь.

##### `clearSelection(): void`

Очищает выбранные даты и сбрасывает `value`.

##### `handleClearAndClose(): void`

Очищает выбранные даты и закрывает календарь.

##### `handleClickOutside(event: MouseEvent): void`

Обрабатывает клик вне компонента для закрытия календаря.

**Алгоритм:**
- Проверяет, что клик был вне `datepickerRef`
- Закрывает календарь если условие выполнено

#### Вспомогательные функции

##### `getDaysInMonth(month: number, year: number): number`

Возвращает количество дней в месяце.

##### `getFirstDayOfMonth(month: number, year: number): number`

Возвращает день недели первого дня месяца (0 = понедельник, 6 = воскресенье).

##### `getDateState(dateOnly: Date): DateState`

Определяет состояние даты относительно выбранного диапазона.

**Возвращает:**
```typescript
{
  isStartDate: boolean;  // Является ли датой заезда
  isEndDate: boolean;   // Является ли датой выезда
  isInRange: boolean;   // Находится ли в диапазоне
  isPast: boolean;      // Прошедшая дата
}
```

##### `createDayObject(dateOnly: Date, day: number, isCurrentMonth: boolean): Day`

Создает объект дня для календаря с вычисленными состояниями и ценой.

#### Watchers

##### `watch(value, ...)`

Отслеживает изменения `modelValue` и синхронизирует внутренние состояния.

**Опции:** `{ immediate: true }` - выполняется сразу при инициализации

##### `watch(isOpen, ...)`

При открытии календаря загружает цены для видимых месяцев.

##### `watch([currentMonth, currentYear], ...)`

При изменении месяца/года загружает цены для видимых месяцев (если календарь открыт).

#### Lifecycle Hooks

##### `onMounted()`

Добавляет обработчик клика вне компонента на `document`.

##### `onUnmounted()`

Удаляет обработчик клика вне компонента с `document`.

### Template

Компонент рендерит календарь со следующей структурой:

```vue
<div :class="$style.datepickerWithPrices">
  <!-- Поле ввода с выбранными датами -->
  <CoreDatePickerInput
    :id="datepickerId"
    :display-value="displayValue"
    :placeholder="t('datepicker.selectDates')"
    :is-open="isOpen"
    @toggle="toggleCalendar"
  >
    <template #label>
      {{ t("datepicker.checkInOut") }}
    </template>
    <template #display>
      <time v-if="displayValue && selectedStartDate && selectedEndDate">
        {{ displayValue }}
      </time>
      <span v-else>{{ t("datepicker.selectDates") }}</span>
    </template>
  </CoreDatePickerInput>

  <!-- Попап календаря -->
  <Transition name="calendar">
    <div v-if="isOpen" :class="$style.calendarPopup">
      <!-- Оверлей загрузки -->
      <Transition name="overlay">
        <div v-if="pricesLoading" :class="$style.loadingOverlay">
          <div :class="$style.spinner"></div>
        </div>
      </Transition>

      <!-- Заголовок с навигацией -->
      <CoreCalendarHeader
        :current-month="currentMonth"
        :current-year="currentYear"
        :month-name="currentMonthName"
        :can-go-to-prev-month="canGoToPrevMonth"
        @prev-month="prevMonth"
        @next-month="nextMonth"
      />

      <!-- Сетка календаря -->
      <CoreCalendarGrid
        :calendar-days="calendarDays"
        :week-days="weekDays"
        :prices-loading="pricesLoading"
        @day-click="handleDateClick"
      />

      <!-- Футер с кнопками -->
      <CoreCalendarFooter
        :can-select="!!(selectedStartDate && selectedEndDate)"
        :display-value="displayValue"
        @cancel="handleClearAndClose"
        @select="closeCalendar"
      />
    </div>
  </Transition>
</div>
```

**Структура:**
- `div.datepickerWithPrices` - основная обертка компонента
- `CoreDatePickerInput` - поле ввода с выбранными датами
- `Transition.calendar` - анимация появления/исчезновения календаря
- `div.calendarPopup` - попап с календарем
- `Transition.overlay` - анимация оверлея загрузки
- `div.loadingOverlay` - оверлей загрузки с индикатором
- `CoreCalendarHeader` - заголовок с навигацией
- `CoreCalendarGrid` - сетка с днями
- `CoreCalendarFooter` - футер с кнопками действий

## Использование

### Базовое использование

Компонент использует `v-model` для двустороннего связывания:

```vue
<template>
  <CoreDatePickerWithPrices v-model="selectedDates" />
</template>

<script setup lang="ts">
const selectedDates = ref<[Date, Date] | null>(null);
</script>
```

### Использование с начальными значениями

```vue
<template>
  <CoreDatePickerWithPrices v-model="selectedDates" />
</template>

<script setup lang="ts">
const selectedDates = ref<[Date, Date] | null>([
  new Date('2024-12-01'),
  new Date('2024-12-05'),
]);
</script>
```

### Обработка изменений

```vue
<template>
  <CoreDatePickerWithPrices 
    v-model="selectedDates"
    @update:modelValue="handleDateChange"
  />
</template>

<script setup lang="ts">
const selectedDates = ref<[Date, Date] | null>(null);

const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    console.log('Заезд:', dates[0]);
    console.log('Выезд:', dates[1]);
  } else {
    console.log('Даты сброшены');
  }
};
</script>
```

## Состояния компонента

### Состояние открытия/закрытия

Календарь управляется через:
- `isOpen` - реактивное состояние
- `toggleCalendar()` - переключение состояния
- `closeCalendar()` - закрытие календаря
- Автоматическое закрытие при клике вне компонента

### Состояние загрузки цен

Компонент отображает оверлей загрузки при:
- `pricesLoading === true` (из `useCalendarPrices`)
- Оверлей появляется с анимацией fade-in/fade-out
- Отображается спиннер в центре календаря

### Состояние выбранных дат

- **Нет выбранных дат:** Отображается плейсхолдер "Выберите даты"
- **Выбрана только начальная дата:** Отображается только начальная дата, календарь ожидает выбора конечной даты
- **Выбраны обе даты:** Отображается диапазон "ДД.ММ.ГГГГ - ДД.ММ.ГГГГ", кнопка "Выбрать" активна

### Состояния дней календаря

- **Прошедшие даты** (`isPast`): Отключены, неактивны, полупрозрачные
- **Сегодняшний день** (`isToday`): Выделен рамкой
- **Дата заезда** (`isStartDate`): Выделена фоном, белый текст
- **Дата выезда** (`isEndDate`): Выделена фоном, белый текст
- **Дни в диапазоне** (`isInRange`): Подсвечены фоном
- **Дни других месяцев** (`!isCurrentMonth`): Полупрозрачные, серый текст

## Логика работы с ценами

### Загрузка цен

Цены загружаются автоматически:
1. При открытии календаря - для текущего, предыдущего и следующего месяцев
2. При изменении месяца/года - для новых видимых месяцев

### Кэширование

Composable `useCalendarPrices` кэширует загруженные цены:
- Не загружает повторно уже загруженные месяцы
- Дедуплицирует параллельные запросы для одного месяца
- Хранит цены в `Map<string, number>` (ключ: дата в формате ISO)

### Отображение цен

- Цена отображается под числом дня
- Если цена загружена: отображается отформатированная цена (например, "5 000 ₽")
- Если цена загружается: отображается "..."
- Если цена отсутствует: цена не отображается

## Навигация по месяцам

### Переход к предыдущему месяцу

- Кнопка "Предыдущий месяц" отключена, если текущий месяц - текущий месяц года
- При переходе автоматически загружаются цены для нового месяца

### Переход к следующему месяцу

- Переход доступен всегда
- При переходе автоматически загружаются цены для нового месяца

## Валидация

Компонент выполняет следующие проверки:

1. **Прошедшие даты:** Нельзя выбрать дату раньше сегодняшнего дня
2. **Диапазон дат:** При выборе даты раньше начальной, диапазон меняется местами

## Оптимизация производительности

### Мемоизация

Компонент использует `useMemoize` для:
- `getPrevMonth` / `getNextMonth` - вычисление соседних месяцев
- `formatDateForDateTime` - форматирование дат для атрибутов
- `getMonthName` - получение названий месяцев
- `createDateOnly` - создание дат без времени

### Shallow Refs

Используются `shallowRef` для:
- `currentMonth` - простые числовые значения
- `currentYear` - простые числовые значения

### Computed оптимизация

- `calendarDays` - вычисляется только при изменении месяца/года или выбранных дат
- Используются уникальные ключи (`key`) для оптимизации рендеринга списков

## Accessibility (A11y)

Компонент поддерживает доступность:

- **ARIA атрибуты:**
  - `role="group"` на основной обертке
  - `role="dialog"` на попапе календаря
  - `aria-label` для описания элементов
  - `aria-expanded` для состояния открытия
  - `aria-modal="true"` для модального попапа
  - `aria-selected` для выбранных дат
  - `aria-disabled` для прошедших дат
  - `aria-live="polite"` для состояния загрузки

- **Семантические элементы:**
  - `<time>` для отображения дат с атрибутом `datetime`
  - `<nav>` для навигации по месяцам
  - `<button>` для интерактивных элементов

- **Клавиатурная навигация:**
  - Поддержка стандартной навигации браузера
  - Фокус на кнопках и интерактивных элементах

## Стилизация

Компонент использует CSS Modules (`<style module>`) с SCSS.

### Основные классы

- `.datepickerWithPrices` - основная обертка
- `.selectedDates` - отображение выбранных дат
- `.placeholder` - плейсхолдер при отсутствии выбранных дат
- `.calendarPopup` - попап календаря
- `.loadingOverlay` - оверлей загрузки
- `.spinner` - индикатор загрузки

### Анимации

- **`calendar`** - появление/исчезновение календаря (opacity + translateY)
- **`overlay`** - появление/исчезновение оверлея загрузки (opacity)

### Адаптивность

Компонент адаптивен для разных размеров экранов:
- Мобильные устройства: полная ширина с отступами
- Планшеты: фиксированная ширина 420px
- Десктоп: фиксированная ширина 500px

## Примеры использования

### Полный пример страницы бронирования

```vue
<template>
  <div class="booking-page">
    <h1>Бронирование номера</h1>
    <CoreDatePickerWithPrices v-model="bookingDates" />
  </div>
</template>

<script setup lang="ts">
const bookingDates = ref<[Date, Date] | null>(null);
</script>
```

### Пример с обработкой валидации

```vue
<template>
  <div>
    <CoreDatePickerWithPrices v-model="dates" />
    <button 
      :disabled="!dates"
      @click="handleSubmit"
    >
      Продолжить
    </button>
  </div>
</template>

<script setup lang="ts">
const dates = ref<[Date, Date] | null>(null);

const handleSubmit = () => {
  if (dates.value) {
    // Обработка выбранных дат
    console.log('Заезд:', dates.value[0]);
    console.log('Выезд:', dates.value[1]);
  }
};
</script>
```

## Примечания

- Компонент автоматически загружает цены при открытии и изменении месяца
- Цены кэшируются в composable `useCalendarPrices`
- Компонент использует локализацию через vue-i18n
- Все даты нормализуются (время = 00:00:00) для корректного сравнения
- Компонент закрывается при клике вне его области
- Поддерживается работа с клавиатурой и скринридерами

## Связанные компоненты

- `CoreDatePickerInput` - поле ввода для отображения выбранных дат
- `CoreCalendarHeader` - заголовок календаря с навигацией
- `CoreCalendarGrid` - сетка календаря с днями
- `CoreCalendarDay` - отдельный день календаря
- `CoreCalendarFooter` - футер календаря с кнопками

## Связанные composables

- `useCalendarPrices` - загрузка и управление ценами календаря
- `useDateLocale` - локализация названий месяцев и дней недели

## Связанные страницы

- `/booking` - страница бронирования (использует компонент)
- `/rooms` - страница выбора номеров (использует компонент)

