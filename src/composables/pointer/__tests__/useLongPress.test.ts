import type * as Vue from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLongPress } from '../useLongPress';

vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal<typeof Vue>()),
  onBeforeUnmount: vi.fn(),
}));

const pointer = (clientX = 0, clientY = 0, button = 0) => ({ button, clientX, clientY }) as PointerEvent;

const click = () => ({ preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as MouseEvent;

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires after the delay and swallows the following click', () => {
    const onLongPress = vi.fn();
    const handlers = useLongPress(onLongPress, 500);

    handlers.pointerdown(pointer());
    vi.advanceTimersByTime(500);

    expect(onLongPress).toHaveBeenCalledOnce();

    const event = click();
    handlers.clickCapture(event);
    expect(event.stopPropagation).toHaveBeenCalled();

    const nextEvent = click();
    handlers.clickCapture(nextEvent);
    expect(nextEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('lets a short press through as a click', () => {
    const onLongPress = vi.fn();
    const handlers = useLongPress(onLongPress, 500);

    handlers.pointerdown(pointer());
    vi.advanceTimersByTime(200);
    handlers.pointerup();
    vi.advanceTimersByTime(500);

    const event = click();
    handlers.clickCapture(event);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('cancels when the pointer moves or a secondary button is used', () => {
    const onLongPress = vi.fn();
    const handlers = useLongPress(onLongPress, 500);

    handlers.pointerdown(pointer());
    handlers.pointermove(pointer(3, 3));
    handlers.pointermove(pointer(20, 0));
    handlers.pointerdown(pointer(0, 0, 2));
    vi.advanceTimersByTime(500);

    expect(onLongPress).not.toHaveBeenCalled();
  });
});
