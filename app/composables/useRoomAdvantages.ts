import type { Room } from "~/types/room";

/**
 * Возвращает массив подписей преимуществ номера из view, bed, balcony (только непустые).
 */
export function useRoomAdvantages(room: MaybeRef<Room | null>) {
  return computed(() => {
    const r = toRef(room).value;
    if (!r) return [];
    const items: string[] = [];
    if (r.view?.title) items.push(r.view.title);
    if (r.bed?.title) items.push(r.bed.title);
    if (r.balcony?.title) items.push(r.balcony.title);
    return items;
  });
}
