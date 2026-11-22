import type { NyaaMirror } from '@/interfaces/nyaa/NyaaMirror';

import { getEnvArray } from '@/utils/env/getEnvArray';

/**
 * The nyaa mirrors to pick from, the default first, from `VITE_NYAA_MIRRORS`: which ones work changes from day to
 * day, so the list is configuration rather than code. The browser gets past their Cloudflare checks, which the
 * backend can't.
 */
export const nyaaMirrors: NyaaMirror[] = getEnvArray('VITE_NYAA_MIRRORS').map((address) => {
  const url = new URL(address);

  return { host: url.host, url: url.origin };
});
