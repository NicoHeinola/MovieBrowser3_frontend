import type { ShowGridLayout } from './ShowGridLayout';

import { SHOW_GRID_CARD_HEIGHT } from './showGridCardHeight';
import { SHOW_GRID_CARD_WIDTH } from './showGridCardWidth';

/** Space between show cards (`ga-8` in `ShowGrid`), in pixels. */
const SHOW_GRID_GAP = 32;

/** Horizontal padding of `PageContainer` (`pa-12` on both sides), in pixels. */
const PAGE_HORIZONTAL_PADDING = 96;

/** Height above the first row of cards: the top navigation, search toolbar and result count, in pixels. */
const GRID_TOP_OFFSET = 225;

/** Fewest rows on a page. A single row is too little to browse, so short windows scroll instead. */
const MIN_ROWS = 2;

/**
 * Fits the show grid to a viewport: as many columns and whole rows as fit, so a full page fills the screen without
 * scrolling and its last row is never left half empty. The floating pagination is left out, since it only covers the
 * bottom of the page and the page can scroll past it.
 *
 * @param viewportWidth - Viewport width in pixels, scrollbar included.
 * @param viewportHeight - Viewport height in pixels.
 * @returns The page size and grid width for that viewport.
 */
export const getShowGridLayout = (viewportWidth: number, viewportHeight: number): ShowGridLayout => {
  const availableWidth = viewportWidth - PAGE_HORIZONTAL_PADDING;

  // N columns or rows need N cards and N - 1 gaps, so adding one gap makes each of them cost the same.
  const columns = Math.max(1, Math.floor((availableWidth + SHOW_GRID_GAP) / (SHOW_GRID_CARD_WIDTH + SHOW_GRID_GAP)));
  const rows = Math.max(
    MIN_ROWS,
    Math.floor((viewportHeight - GRID_TOP_OFFSET + SHOW_GRID_GAP) / (SHOW_GRID_CARD_HEIGHT + SHOW_GRID_GAP)),
  );

  return {
    pageSize: columns * rows,
    width: columns * (SHOW_GRID_CARD_WIDTH + SHOW_GRID_GAP) - SHOW_GRID_GAP,
  };
};
