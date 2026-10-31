import { onBeforeUnmount } from 'vue';

/** How long the primary button must be held before it counts as a long press. */
const DEFAULT_DELAY = 500;

/** How far the pointer may move before the press counts as a drag instead. */
const MOVE_TOLERANCE = 6;

/**
 * Detects holding the primary pointer button on an element and swallows the click that follows a long press.
 * Moving the pointer, for example to drag a carousel, cancels the press.
 * @param onLongPress - Called once the press has been held for the delay.
 * @param delay - The hold duration in milliseconds.
 * @returns Event handlers to bind on the element with `v-on`.
 */
export const useLongPress = (onLongPress: () => void, delay: number = DEFAULT_DELAY) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let isLongPress = false;

  /** Stops waiting for the current press. */
  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  /**
   * Starts waiting for a long press.
   * @param event - The pointerdown event.
   */
  const onPointerdown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return;
    }

    cancel();
    isLongPress = false;
    startX = event.clientX;
    startY = event.clientY;

    timeoutId = setTimeout(() => {
      timeoutId = null;
      isLongPress = true;
      onLongPress();
    }, delay);
  };

  /**
   * Cancels the press once the pointer moves past the tolerance.
   * @param event - The pointermove event.
   */
  const onPointermove = (event: PointerEvent): void => {
    if (timeoutId && Math.hypot(event.clientX - startX, event.clientY - startY) > MOVE_TOLERANCE) {
      cancel();
    }
  };

  /**
   * Stops the click that ends a long press from reaching other listeners.
   * @param event - The click event, handled in the capture phase.
   */
  const onClickCapture = (event: MouseEvent): void => {
    if (!isLongPress) {
      return;
    }

    isLongPress = false;
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Keeps touch devices from opening the context menu while the element is pressed.
   * @param event - The contextmenu event.
   */
  const onContextmenu = (event: Event): void => {
    if (isLongPress || timeoutId) {
      event.preventDefault();
    }
  };

  onBeforeUnmount(cancel);

  return {
    clickCapture: onClickCapture,
    contextmenu: onContextmenu,
    pointercancel: cancel,
    pointerdown: onPointerdown,
    pointerleave: cancel,
    pointermove: onPointermove,
    pointerup: cancel,
  };
};
