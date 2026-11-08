import type { StorageSlice } from './StorageSlice';

import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

/**
 * Names a slice for the tooltip and the legend.
 * @param slice - The slice.
 * @param t - The i18n translate function, so the name follows the active language.
 * @returns The show's title, or the translated name of the disk part.
 */
export const getStorageSliceLabel = (slice: StorageSlice, t: (key: string) => string): string => {
  if (slice.show) return getPrimaryTitle(slice.show);

  return t(`dashboard.storageKinds.${slice.kind}`);
};
