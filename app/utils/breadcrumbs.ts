/** Подпись корневой крошки бронирования */
export const BREADCRUMB_HOME_LABEL = "Главная / Бронирование";

/** Русские заголовки хлебных крошек по пути маршрута */
export const BREADCRUMB_ROUTE_TITLES = {
  "/rooms": "Выбор номера",
  "/rooms/tariff": "Выбор тарифа",
  "/multi-rooms": "Выбор номеров и тарифов",
  "/personal": "Личные данные",
  "/services": "Выбор услуг",
  "/confirmation": "Ваше бронирование",
  "/cancellation": "Отмена бронирования",
  "/booking-details": "Детали бронирования",
  "/cabinet": "Личный кабинет",
} as const satisfies Record<string, string>;

type BreadcrumbRoutePath = keyof typeof BREADCRUMB_ROUTE_TITLES;

export const getBreadcrumbRouteTitle = (path: string): string => {
  if (path in BREADCRUMB_ROUTE_TITLES) {
    return BREADCRUMB_ROUTE_TITLES[path as BreadcrumbRoutePath];
  }

  if (path.includes("/rooms") && !path.includes("/tariff")) {
    return BREADCRUMB_ROUTE_TITLES["/rooms"];
  }
  if (path.includes("/tariff")) {
    return BREADCRUMB_ROUTE_TITLES["/rooms/tariff"];
  }

  const lastSegment = path.split("/").filter(Boolean).at(-1);
  if (lastSegment) {
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  return "Страница";
};
