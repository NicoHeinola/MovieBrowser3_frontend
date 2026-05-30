interface HasTitles {
  titles?: { title: string; is_primary?: boolean }[] | null;
}

export const getPrimaryTitle = (source: HasTitles | null | undefined, fallbackTitle = 'Untitled'): string => {
  const titles = source?.titles ?? [];

  if (titles.length === 0) {
    return fallbackTitle;
  }

  return titles.find((title) => title.is_primary)?.title ?? titles[0]?.title ?? fallbackTitle;
};
