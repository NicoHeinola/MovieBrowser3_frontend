import type { ShowGridLayout } from './ShowGridLayout';

import { SHOW_GRID_CARD_WIDTH } from './showGridCardWidth';

/** Space between show cards (`ga-8` in `ShowGrid`), in pixels. */
const SHOW_GRID_GAP = 32;

/** Horizontal padding of `PageContainer` (`pa-12` on both sides), in pixels. */
const PAGE_HORIZONTAL_PADDING = 96;

/** About how many shows a page holds. 8 columns of 4 rows, the layout of a 2560 pixel wide screen. */
const TARGET_PAGE_SIZE = 32;

/**
 * Fits the show grid to a viewport: as many columns as fit, and the number of whole rows closest to the target page
 * size, so the last row of a full page is never left half empty.
 *
 * @param viewportWidth - Viewport width in pixels, scrollbar included.
 * @returns The page size and grid width for that viewport.
 */
export const getShowGridLayout = (viewportWidth: number): ShowGridLayout => {
  const availableWidth = viewportWidth - PAGE_HORIZONTAL_PADDING;

  // N columns need N cards and N - 1 gaps, so adding one gap makes every column cost the same.
  const columns = Math.max(1, Math.floor((availableWidth + SHOW_GRID_GAP) / (SHOW_GRID_CARD_WIDTH + SHOW_GRID_GAP)));
  const rows = Math.max(1, Math.round(TARGET_PAGE_SIZE / columns));

  return {
    pageSize: columns * rows,
    width: columns * (SHOW_GRID_CARD_WIDTH + SHOW_GRID_GAP) - SHOW_GRID_GAP,
  };
};
