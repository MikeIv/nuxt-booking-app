/**
 * Плагин для регистрации системы уведомлений
 * Обеспечивает правильную работу useNotifications и useNotificationToast
 */
export default defineNuxtPlugin(() => {
  // Плагин нужен только для инициализации
  // useNotifications и useNotificationToast будут доступны через auto-import
  // Но мы можем проверить, что они работают правильно
  if (import.meta.env.DEV) {
    console.log("🔔 Notifications plugin initialized");
  }
});
