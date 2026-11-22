import type { NyaaMirror } from '@/interfaces/nyaa/NyaaMirror';

/**
 * The nyaa mirrors to pick from, the default first. Which ones work changes from day to day; the browser gets past
 * their Cloudflare checks, which the backend can't.
 */
export const nyaaMirrors: NyaaMirror[] = [
  { host: 'nyaa.si', url: 'https://nyaa.si' },
  { host: 'nyaa.land', url: 'https://nyaa.land' },
  { host: 'nyaa.digital', url: 'https://nyaa.digital' },
  { host: 'nyaa.iss.one', url: 'https://nyaa.iss.one' },
  { host: 'nyaa.iss.ink', url: 'https://nyaa.iss.ink' },
];
