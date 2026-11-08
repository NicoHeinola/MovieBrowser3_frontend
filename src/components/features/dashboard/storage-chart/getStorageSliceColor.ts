import type { StorageSlice } from './StorageSlice';

import { chartPalette } from '@/plugins/vuetify/chartPalette';

/**
 * Picks a slice's color: theme colors for the disk parts, the palette in turn for shows.
 * @param slice - The slice.
 * @param index - Its position in its ring; shows take the palette color at that position.
 * @param colors - The active theme's colors.
 * @returns A CSS color.
 */
export const getStorageSliceColor = (slice: StorageSlice, index: number, colors: Record<string, string>): string => {
  switch (slice.kind) {
    case 'videos': {
      return colors.primary!;
    }
    case 'otherFiles': {
      return colors.secondary!;
    }
    case 'free': {
      return colors['storage-free']!;
    }
    case 'otherShows': {
      return colors['storage-other-shows']!;
    }
    case 'gap': {
      return 'transparent';
    }
    default: {
      return chartPalette[index % chartPalette.length]!;
    }
  }
};
