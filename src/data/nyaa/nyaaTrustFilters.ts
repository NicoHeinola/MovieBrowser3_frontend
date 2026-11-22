import type { NyaaOption } from '@/interfaces/nyaa/NyaaOption';

/** nyaa's trust filters, as its `f` values. */
export const nyaaTrustFilters: NyaaOption[] = [
  { value: '0', titleKey: 'torrents.nyaa.filters.none', icon: 'mdi-all-inclusive' },
  { value: '1', titleKey: 'torrents.nyaa.filters.noRemakes', icon: 'mdi-content-duplicate' },
  { value: '2', titleKey: 'torrents.nyaa.filters.trustedOnly', icon: 'mdi-shield-check' },
];
