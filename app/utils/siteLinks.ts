/**
 * Внешние ссылки на сайт проекта (общие для футера, aside и др.)
 */
const BASE_URL = "http://varvarkan.grandfs.ru";

export interface SiteLink {
  url: string;
  label: string;
  external?: boolean;
}

/** Ссылки для навигации в футере и меню */
export const FOOTER_NAV_LINKS: SiteLink[] = [
  { url: "/", label: "Главная", external: false },
  { url: `${BASE_URL}/about.php`, label: "О проекте", external: true },
  { url: `${BASE_URL}/hotel.php`, label: "Отель", external: true },
  { url: `${BASE_URL}/service.php`, label: "Сервисы", external: true },
  { url: `${BASE_URL}/gallery.php`, label: "Галерея", external: true },
  {
    url: `${BASE_URL}/construction-progress.php`,
    label: "Этапы строительства",
    external: true,
  },
  { url: `${BASE_URL}/contacts.php`, label: "Контакты", external: true },
];
