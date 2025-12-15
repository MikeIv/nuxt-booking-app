# useApi - Composable для работы с API

## Обзор

`useApi` - это универсальный composable для выполнения HTTP-запросов к API с автоматическим управлением токенами авторизации.

## Местоположение

`app/composables/useApi.ts`

## Основные возможности

### 1. Автоматическая авторизация

- Добавляет `Authorization: Bearer {token}` ко всем запросам
- Читает токен из `authStore`
- Отправляет cookies для работы с refresh token

### 2. Автоматическое обновление токена

При получении ответов **401** или **302**:

- Автоматически запрашивает новый токен через `/v1/auth/refresh`
- Обновляет токен в `authStore`
- Повторяет исходный запрос с новым токеном
- При неудаче перенаправляет на главную страницу

### 3. Предотвращение дублирования

- Блокирует множественные одновременные запросы на refresh
- Использует единый Promise для всех параллельных попыток обновления

## Использование

```typescript
const { get, post, put, patch, delete: del } = useApi();

// GET запрос
const response = await get<DataType>("/v1/endpoint", { param: "value" });

// POST запрос
const response = await post<DataType>("/v1/endpoint", { key: "value" });

// PUT запрос
const response = await put<DataType>("/v1/endpoint", { key: "value" });

// PATCH запрос
const response = await patch<DataType>("/v1/endpoint", { key: "value" });

// DELETE запрос
const response = await del<DataType>("/v1/endpoint");
```

## API

### Методы

#### `get<T>(url: string, params?: Record<string, unknown>, options?: FetchOptions)`

Выполняет GET запрос.

**Параметры:**

- `url` - относительный путь к endpoint (например, `/v1/users/profile`)
- `params` - query параметры (необязательно)
- `options` - дополнительные опции fetch (необязательно)

**Возвращает:** `Promise<ApiResponse<T>>`

#### `post<T>(url: string, body?: unknown, options?: FetchOptions)`

Выполняет POST запрос.

**Параметры:**

- `url` - относительный путь к endpoint
- `body` - тело запроса (необязательно)
- `options` - дополнительные опции fetch (необязательно)

**Возвращает:** `Promise<ApiResponse<T>>`

#### `put<T>(url: string, body?: unknown, options?: FetchOptions)`

Выполняет PUT запрос.

#### `patch<T>(url: string, body?: unknown, options?: FetchOptions)`

Выполняет PATCH запрос.

#### `delete<T>(url: string, options?: FetchOptions)`

Выполняет DELETE запрос.

## Типы

### ApiResponse<T>

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  payload?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

### ApiError

```typescript
interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: unknown;
}
```

## Конфигурация

### Base URL

Берется из `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: "https://varvarka-api.grandfs-develop.ru/api";
  }
}
```

### Заголовки по умолчанию

```typescript
{
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}" // если токен доступен
}
```

### Credentials

```typescript
credentials: "include"; // Для работы с cookies (refresh token)
```

## Логирование (режим разработки)

### При инициализации

```
🔧 useApi initialized with baseURL: https://varvarka-api.grandfs-develop.ru/api
```

### При выполнении запроса

```
🔐 Token status: Present (eyJhbGciOiJIUzI1NiIsI...)
🔄 API Request: {
  fullUrl: "https://varvarka-api.grandfs-develop.ru/api/v1/users/profile",
  baseURL: "https://varvarka-api.grandfs-develop.ru/api",
  request: "/v1/users/profile",
  retry: 0
}
```

### При обновлении токена

```
⚠️ Получен статус 401, пробуем обновить токен...
🔄 Обновление токена...
✅ Токен успешно обновлен
🔁 Повторяем запрос с новым токеном...
```

### При ошибке обновления токена

```
❌ Ошибка обновления токена: {...}
❌ Не удалось обновить токен, перенаправляем на логин
```

## Обработка ошибок

### Автоматическая обработка

- **401/302** - Автоматическое обновление токена и повтор запроса
- **Другие ошибки** - Бросает `ApiError`

### Ручная обработка

```typescript
try {
  const response = await get("/v1/endpoint");
  if (response.success) {
    // Обработка успешного ответа
  } else {
    // Обработка неуспешного ответа (success: false)
  }
} catch (error) {
  // Обработка сетевых ошибок или ошибок API
  const apiError = error as ApiError;
  console.error(apiError.message);
}
```

## Примеры использования

### Загрузка профиля пользователя

```typescript
const fetchProfile = async () => {
  try {
    const { get } = useApi();
    const response = await get<ProfileData>("/v1/users/profile");

    if (response.success && response.payload) {
      return response.payload;
    }
  } catch (error) {
    console.error("Ошибка загрузки профиля:", error);
  }
};
```

### Обновление данных

```typescript
const updateProfile = async (data: ProfileData) => {
  try {
    const { put } = useApi();
    const response = await put<ProfileData>("/v1/users/profile", data);

    if (response.success) {
      console.log("Профиль обновлен");
    }
  } catch (error) {
    console.error("Ошибка обновления:", error);
  }
};
```

### Загрузка с параметрами

```typescript
const searchRooms = async (dateFrom: string, dateTo: string) => {
  try {
    const { get } = useApi();
    const response = await get<RoomsData>("/v1/rooms/search", {
      date_from: dateFrom,
      date_to: dateTo,
    });

    return response.payload;
  } catch (error) {
    console.error("Ошибка поиска:", error);
  }
};
```

## Безопасность

1. **Токены не логируются полностью** - только первые 20 символов
2. **Автоматическое удаление токена** при неудачном refresh
3. **Перенаправление на главную** при потере авторизации
4. **Защита от множественных refresh** - использование единого Promise

## Интеграция с authStore

Composable автоматически работает с `authStore`:

- Читает токен: `authStore.token`
- Обновляет токен: `authStore.setToken(newToken)`
- Выполняет logout: `authStore.logout()`

## Зависимости

- `@nuxt/runtime-config` - для получения baseURL
- `ofetch` / `$fetch` - для выполнения запросов
- `pinia` - для работы с authStore
- `vue-router` - для перенаправлений
