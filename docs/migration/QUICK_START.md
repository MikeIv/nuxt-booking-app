# 🚀 Быстрый старт: Перенос календаря с ценами

## Шаг 1: Скопируйте файлы

```bash
# Компоненты
cp app/components/core/DatePickerWithPrices.vue your-project/components/calendar/
cp app/components/core/DatePickerInput.vue your-project/components/calendar/
cp -r app/components/core/calendar your-project/components/calendar/

# Composables
cp app/composables/useCalendarPrices.ts your-project/composables/
cp app/composables/useDateLocale.ts your-project/composables/
```

## Шаг 2: Установите зависимости

```bash
npm install @vueuse/core @vueuse/nuxt vue-i18n
# или
yarn add @vueuse/core @vueuse/nuxt vue-i18n
```

## Шаг 3: Адаптируйте API

Откройте `composables/useCalendarPrices.ts` и замените:

```typescript
// Было:
const api = useApi();

// Стало (выберите один вариант):
// Вариант 1: Fetch API
const fetchCalendarPrices = async (month: number, year: number) => {
  const response = await fetch(`/api/calendar?month=${month}&year=${year}`);
  const data = await response.json();
  // ... обработка данных
};

// Вариант 2: Axios
import axios from "axios";
const response = await axios.get("/api/calendar", { params: { month, year } });

// Вариант 3: Ваш API клиент
const response = await yourApiClient.getCalendar(month, year);
```

## Шаг 4: Адаптируйте i18n (если нужно)

Если не используете i18n, в `useDateLocale.ts`:

```typescript
// Замените:
const { locale } = useI18n();

// На:
const locale = ref("ru"); // или 'en'
```

## Шаг 5: Замените UIcon

В файлах компонентов найдите и замените:

```vue
<!-- Было -->
<UIcon name="i-calendar" />

<!-- Стало -->
<YourIconComponent name="calendar" />
<!-- или SVG -->
<svg><use href="#icon-calendar" /></svg>
```

## Шаг 6: Используйте компонент

```vue
<template>
  <DatePickerWithPrices v-model="dates" />
</template>

<script setup>
import { ref } from "vue";
import DatePickerWithPrices from "@/components/calendar/DatePickerWithPrices.vue";

const dates = (ref < [Date, Date]) | (null > null);
</script>
```

## ✅ Готово!

Подробная документация: [CalendarWithPrices.md](./CalendarWithPrices.md)
