# Перенос календаря с ценами в другой проект

## 📋 Обзор

Компонент `DatePickerWithPrices` можно использовать в других проектах. Для этого нужно перенести файлы и адаптировать зависимости.

## 📦 Структура файлов для переноса

### Обязательные файлы

```
your-project/
├── components/
│   └── calendar/
│       ├── DatePickerWithPrices.vue      # Главный компонент
│       ├── DatePickerInput.vue            # Поле ввода
│       └── calendar/
│           ├── Day.vue                    # День календаря
│           ├── Footer.vue                 # Футер календаря
│           ├── Grid.vue                   # Сетка календаря
│           └── Header.vue                 # Заголовок календаря
├── composables/
│   ├── useCalendarPrices.ts               # Работа с ценами
│   └── useDateLocale.ts                   # Локализация дат
└── assets/
    └── icons/                             # Иконки (опционально)
        ├── calendar.svg
        └── arrow-back.svg
```

## 🔌 Зависимости

### Обязательные зависимости

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "@vueuse/core": "^13.0.0",
    "@vueuse/nuxt": "^13.0.0",
    "vue-i18n": "^9.0.0" // или другой i18n
  }
}
```

### Опциональные зависимости

- `@nuxt/ui` - для компонента `UIcon` (можно заменить на свой компонент иконок)
- `@nuxt/icon` - для работы с иконками

## 🔧 Адаптация под другой проект

### 1. Адаптация API (useCalendarPrices.ts)

Компонент использует `useApi()` composable. Вам нужно адаптировать его под ваш API:

**Вариант A: Заменить useApi на ваш API клиент**

```typescript
// composables/useCalendarPrices.ts
export const useCalendarPrices = () => {
  // Замените useApi() на ваш API клиент
  // const api = useYourApi();
  // или
  // const api = useFetch(); // если используете Nuxt useFetch

  const fetchCalendarPrices = async (month: number, year: number) => {
    // Адаптируйте под ваш API endpoint
    const response = await api.get("/v1/search/calendar", {
      month,
      year,
    });

    // Адаптируйте обработку ответа под формат вашего API
    if (response.success && response.payload) {
      response.payload.forEach((item) => {
        prices.value.set(item.date_at, item.min_price);
      });
    }
  };

  // ... остальной код
};
```

**Вариант B: Создать адаптер**

```typescript
// composables/useCalendarPricesAdapter.ts
export const useCalendarPricesAdapter = (apiClient: YourApiClient) => {
  const fetchCalendarPrices = async (month: number, year: number) => {
    // Используйте ваш API клиент
    const data = await apiClient.getCalendarPrices(month, year);
    // Преобразуйте в нужный формат
    return data.map((item) => ({
      date_at: item.date,
      min_price: item.price,
    }));
  };

  return { fetchCalendarPrices };
};
```

### 2. Адаптация i18n (useDateLocale.ts)

Если вы используете другой i18n или не используете его вообще:

**Вариант A: Без i18n (статическая локализация)**

```typescript
// composables/useDateLocale.ts
export const useDateLocale = () => {
  const locale = ref("ru"); // или 'en'

  const monthNames = computed(() => {
    const localeKey = locale.value === "ru" ? "ru-RU" : "en-US";
    // ... остальной код без изменений
  });

  // ... остальной код
};
```

**Вариант B: С другим i18n**

```typescript
// composables/useDateLocale.ts
import { useI18n as useYourI18n } from "your-i18n-library";

export const useDateLocale = () => {
  const { locale } = useYourI18n();
  // ... остальной код
};
```

### 3. Замена UI компонентов

#### Замена UIcon

Если у вас нет `@nuxt/ui`, замените `UIcon` на свой компонент:

**В DatePickerInput.vue:**

```vue
<!-- Было -->
<UIcon name="i-calendar" :class="$style.calendarIcon" />

<!-- Стало -->
<YourIconComponent name="calendar" :class="$style.calendarIcon" />
<!-- или -->
<svg :class="$style.calendarIcon"><use href="#icon-calendar" /></svg>
```

**В Header.vue:**

```vue
<!-- Было -->
<UIcon name="i-arrow-back" :class="[$style.navIcon, $style.navIconPrev]" />

<!-- Стало -->
<YourIconComponent
  name="arrow-back"
  :class="[$style.navIcon, $style.navIconPrev]"
/>
```

### 4. Адаптация стилей

Компоненты используют CSS модули (`$style`). Убедитесь, что ваш проект поддерживает это, или адаптируйте:

**Если используете обычные классы:**

```vue
<!-- Было -->
<div :class="$style.datepickerWithPrices"></div>
```

И перенесите стили в глобальный CSS или используйте scoped styles.

### 5. Адаптация под другую структуру проекта

#### Для Nuxt 3/4 (как в текущем проекте)

- Файлы в `components/` и `composables/` автоматически импортируются
- Используйте как есть

#### Для Vue 3 (без Nuxt)

- Импортируйте компоненты и composables явно:

```vue
<script setup>
import DatePickerWithPrices from "@/components/calendar/DatePickerWithPrices.vue";
import { useCalendarPrices } from "@/composables/useCalendarPrices";
import { useDateLocale } from "@/composables/useDateLocale";
</script>
```

#### Для других фреймворков

- Адаптируйте под структуру вашего проекта
- Убедитесь, что Vue 3 API доступен (`ref`, `computed`, `watch`, и т.д.)

## 📝 Пример использования

### Базовое использование

```vue
<template>
  <DatePickerWithPrices v-model="selectedDates" />
</template>

<script setup>
import { ref } from "vue";
import DatePickerWithPrices from "@/components/calendar/DatePickerWithPrices.vue";

const selectedDates = (ref < [Date, Date]) | (null > null);
</script>
```

### С обработкой событий

```vue
<template>
  <DatePickerWithPrices
    v-model="selectedDates"
    @update:modelValue="handleDateChange"
  />
</template>

<script setup>
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    console.log('Выбраны даты:', dates[0], 'до', dates[1]);
  }
};
</script>
```

## 🔄 Миграционный чеклист

- [ ] Скопировать все файлы компонентов
- [ ] Скопировать composables (`useCalendarPrices`, `useDateLocale`)
- [ ] Установить зависимости (`@vueuse/core`, `vue-i18n`)
- [ ] Адаптировать `useCalendarPrices` под ваш API
- [ ] Адаптировать `useDateLocale` под ваш i18n (или убрать)
- [ ] Заменить `UIcon` на ваш компонент иконок
- [ ] Проверить работу CSS модулей или адаптировать стили
- [ ] Добавить переводы для i18n ключей (если используете)
- [ ] Протестировать компонент в вашем проекте

## 🌐 Переводы (i18n)

Если используете i18n, добавьте переводы:

```json
// locales/ru.json
{
  "datepicker": {
    "checkInOut": "Заезд — выезд",
    "selectDates": "Выберите даты",
    "cancel": "Отмена",
    "select": "Выбрать"
  }
}

// locales/en.json
{
  "datepicker": {
    "checkInOut": "Check-in — Check-out",
    "selectDates": "Select dates",
    "cancel": "Cancel",
    "select": "Select"
  }
}
```

## 🎨 Кастомизация стилей

Стили используют CSS переменные. Адаптируйте под вашу дизайн-систему:

```scss
// Ваши CSS переменные
:root {
  --a-text-dark: #000;
  --a-text-light: #666;
  --a-whiteBg: #fff;
  --a-border-accent: #e0e0e0;
  --a-primaryBg: #007bff;
  // ... и т.д.
}
```

## ⚠️ Важные замечания

1. **API формат**: Убедитесь, что ваш API возвращает данные в формате:

   ```typescript
   {
     date_at: string; // "2024-01-15"
     min_price: number;
   }
   [];
   ```

2. **Производительность**: Компонент оптимизирован с мемоизацией. Не удаляйте оптимизации без необходимости.

3. **Типы**: Компонент использует TypeScript. Убедитесь, что типы корректны в вашем проекте.

4. **Доступность**: Компонент включает ARIA атрибуты для доступности. Сохраните их при адаптации.

## 🚀 Создание npm пакета (опционально)

Если хотите использовать компонент как пакет:

```json
// package.json
{
  "name": "@your-org/calendar-with-prices",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.5.0",
    "@vueuse/core": "^13.0.0"
  }
}
```

## 📚 Дополнительные ресурсы

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VueUse Documentation](https://vueuse.org/)
- [Vue i18n](https://vue-i18n.intlify.dev/)
