/**
 * Builds the address of a search on a nyaa mirror.
 * @param mirrorUrl - The mirror to search on, such as `https://nyaa.si`.
 * @param params - nyaa's `q`, `c` and `f` params, as the nyaa filters build them; a missing one searches everything.
 * @param sort - nyaa sort field, with a leading `-` for descending, such as `-size`.
 * @returns The search address.
 */
export const getNyaaSearchUrl = (
  mirrorUrl: string,
  params: Record<string, string | string[]> | undefined,
  sort: string,
): string => {
  const query = new URLSearchParams({
    f: String(params?.f ?? '0'),
    c: String(params?.c ?? '0_0'),
    q: String(params?.q ?? ''),
    s: sort.replace(/^-/, ''),
    o: sort.startsWith('-') ? 'desc' : 'asc',
  });

  return `${mirrorUrl}/?${query.toString()}`;
};
