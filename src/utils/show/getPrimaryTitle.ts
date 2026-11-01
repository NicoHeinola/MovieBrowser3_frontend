import { i18n } from '@/plugins/i18n';

interface HasTitles {
  titles?: { title: string; is_primary?: boolean }[] | null;
}

export const getPrimaryTitle = (
  source: HasTitles | null | undefined,
  fallbackTitle = i18n.global.t('show.untitled'),
): string => {
  const titles = source?.titles ?? [];

  if (titles.length === 0) {
    return fallbackTitle;
  }

  return titles.find((title) => title.is_primary)?.title ?? titles[0]?.title ?? fallbackTitle;
};
