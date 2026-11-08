import { onScopeDispose } from 'vue';

/** How many open overlays block scrolling; the page scrolls again when the last of them closes. */
let blockingOverlayCount = 0;

/**
 * Vuetify scroll strategy that blocks page scrolling while a dialog is open by hiding the page's overflow.
 * Vuetify's own `block` strategy makes `<html>` `position: fixed` and shifts it up by the scroll position instead, and
 * Firefox then stops painting the page's fixed and sticky elements (floating save bars, sticky side menus) and places
 * dialogs off center. Vuetify runs a strategy inside the overlay's effect scope, so the dispose hook unblocks when the
 * overlay closes.
 * @returns Nothing.
 */
export const overflowBlockScrollStrategy = (): void => {
  const html = document.documentElement;

  blockingOverlayCount += 1;

  // A dialog opened from a dialog finds the page blocked already.
  if (blockingOverlayCount === 1) {
    // Pad by the scrollbar's width, so the page doesn't shift sideways when the scrollbar disappears.
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = 'hidden';
    html.style.paddingInlineEnd = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
  }

  onScopeDispose(() => {
    blockingOverlayCount = Math.max(0, blockingOverlayCount - 1);

    if (blockingOverlayCount === 0) {
      html.style.overflow = '';
      html.style.paddingInlineEnd = '';
    }
  });
};
