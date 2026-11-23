/**
 * The name a magnet link gives its torrent (`dn`), for a torrent added by hand.
 * @param magnetUrl - The magnet link.
 * @returns The name, or null when the link has none.
 */
export const getMagnetName = (magnetUrl: string): string | null => {
  const query = magnetUrl.slice(magnetUrl.indexOf('?') + 1);
  const name = new URLSearchParams(query).get('dn')?.trim();

  return name || null;
};
