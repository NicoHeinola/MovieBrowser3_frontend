interface HasTitles {
  titles: { title: string; is_primary?: boolean }[];
}

export const getPrimaryTitle = (source: HasTitles | null | undefined, fallbackTitle = 'Untitled'): string => {
  if (!source) {
    return fallbackTitle;
  }

  return source.titles.find((title) => title.is_primary)?.title ?? source.titles[0]?.title ?? fallbackTitle;
};
