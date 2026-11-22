/**
 * Every sort the nekoBT search accepts: each field ascending and with a leading `-` for descending, plus `best`,
 * nekoBT's relevance order, which a URL may still name. The table's column headers pick the rest.
 */
export const nekoBtSortValues: string[] = [
  'best',
  ...['date', 'size', 'seeders', 'leechers', 'downloads', 'comments'].flatMap((field) => [field, `-${field}`]),
];
