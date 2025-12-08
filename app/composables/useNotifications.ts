import { ref, readonly } from "vue";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: "primary" | "secondary";
}

export interface NotificationOptions {
  /** Тип уведомления */
  type?: NotificationType;
  /** Длительность отображения в миллисекундах (0 = не удалять автоматически) */
  duration?: number;
  /** Заголовок уведомления */
  title?: string;
  /** Дополнительные действия */
  actions?: readonly NotificationAction[];
  /** HTML контент вместо текста (используйте с осторожностью) */
  html?: boolean;
  /** Не закрывать при клике на уведомление */
  persistent?: boolean;
  /** Кастомный класс для уведомления */
  customClass?: string;
}

export interface Notification extends NotificationOptions {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
  createdAt: number;
}

/**
 * Кастомная иконка для типа уведомления
 */
export interface CustomIcon {
  /** Компонент иконки (Vue компонент или render function) */
  component: unknown;
  /** Размер иконки (по умолчанию используется --notification-icon-size) */
  size?: string;
}

// Хранилище таймеров для правильной очистки
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// Используем ref для реактивности массива уведомлений
const notifications = ref<Notification[]>([]);

// Конфигурация по умолчанию
const defaultConfig = {
  defaultDuration: 5000,
  maxNotifications: 5,
} as const;

/**
 * Нормализует опции уведомления
 */
const normalizeOptions = (
  optionsOrDuration?: number | NotificationOptions,
): NotificationOptions => {
  return typeof optionsOrDuration === "number"
    ? { duration: optionsOrDuration }
    : optionsOrDuration || {};
};

/**
 * Composable для управления уведомлениями
 *
 * @example
 * ```ts
 * const { success, error } = useNotifications()
 * success('Операция выполнена успешно!')
 * error('Произошла ошибка', { duration: 0 }) // не исчезнет автоматически
 * ```
 */
export const useNotifications = () => {
  /**
   * Удаляет уведомление по ID
   */
  const remove = (id: string): void => {
    // Очистка таймера если он существует
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }

    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  /**
   * Показывает уведомление
   */
  const show = (
    message: string,
    type: NotificationType = "info",
    optionsOrDuration?: number | NotificationOptions,
  ): string => {
    const options = normalizeOptions(optionsOrDuration);
    const id = crypto.randomUUID();
    const notification: Notification = {
      id,
      message,
      type,
      duration: options.duration ?? defaultConfig.defaultDuration,
      title: options.title,
      actions: options.actions,
      html: options.html,
      persistent: options.persistent,
      customClass: options.customClass,
      createdAt: Date.now(),
    };

    // Ограничение количества уведомлений
    if (notifications.value.length >= defaultConfig.maxNotifications) {
      const oldest = notifications.value[0];
      if (oldest) {
        remove(oldest.id);
      }
    }

    notifications.value.push(notification);

    // Автоматическое удаление через указанное время
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        remove(id);
      }, notification.duration);
      timers.set(id, timer);
    }

    return id;
  };

  /**
   * Очищает все уведомления
   */
  const clear = (): void => {
    // Очистка всех таймеров
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    notifications.value = [];
  };

  /**
   * Показывает уведомление об успехе
   */
  const success = (
    message: string,
    optionsOrDuration?: number | NotificationOptions,
  ): string => show(message, "success", optionsOrDuration);

  /**
   * Показывает уведомление об ошибке
   */
  const error = (
    message: string,
    optionsOrDuration?: number | NotificationOptions,
  ): string => show(message, "error", optionsOrDuration);

  /**
   * Показывает предупреждение
   */
  const warning = (
    message: string,
    optionsOrDuration?: number | NotificationOptions,
  ): string => show(message, "warning", optionsOrDuration);

  /**
   * Показывает информационное уведомление
   */
  const info = (
    message: string,
    optionsOrDuration?: number | NotificationOptions,
  ): string => show(message, "info", optionsOrDuration);

  return {
    /** Реактивный список уведомлений (только для чтения) */
    notifications: readonly(notifications),
    /** Показать уведомление */
    show,
    /** Удалить уведомление */
    remove,
    /** Очистить все уведомления */
    clear,
    /** Показать уведомление об успехе */
    success,
    /** Показать уведомление об ошибке */
    error,
    /** Показать предупреждение */
    warning,
    /** Показать информационное уведомление */
    info,
  };
};
