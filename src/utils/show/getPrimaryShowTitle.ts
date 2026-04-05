import type { Show } from '@/interfaces/api/Show';

export const getPrimaryShowTitle = (
  show: Pick<Show, 'titles'> | null | undefined,
  fallbackTitle = 'Untitled Show',
): string => {
  if (!show) {
    return fallbackTitle;
  }

  return show.titles.find((title) => title.is_primary)?.title ?? show.titles[0]?.title ?? fallbackTitle;
};
