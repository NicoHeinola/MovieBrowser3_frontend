import type * as Vue from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useDragScroll } from '../useDragScroll';

vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal<typeof Vue>()),
  onBeforeUnmount: vi.fn(),
}));

const start = vi.fn();
const stop = vi.fn();

vi.mock('../useScrollMomentum', () => ({
  useScrollMomentum: () => ({ start, stop }),
}));

const pointer = (clientX: number, time: number, buttons = 1) =>
  ({ button: 0, buttons, clientX, pointerId: 1, timeStamp: time }) as PointerEvent;

const click = () => ({ preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as MouseEvent;

const createElement = (scrollLeft = 500) =>
  ref({
    clientWidth: 100,
    hasPointerCapture: () => true,
    releasePointerCapture: vi.fn(),
    scrollLeft,
    scrollWidth: 1000,
    setPointerCapture: vi.fn(),
  } as unknown as HTMLElement);

describe('useDragScroll', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('scrolls opposite to the pointer once past the threshold', () => {
    const element = createElement();
    const { handlers, isDragging } = useDragScroll(element, 6);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointermove(pointer(196, 10));
    expect(element.value.scrollLeft).toBe(500);

    handlers.pointermove(pointer(150, 20));
    expect(isDragging.value).toBe(true);
    expect(element.value.scrollLeft).toBe(550);
  });

  it('swallows only the click that ends a drag', () => {
    const element = createElement();
    const { handlers } = useDragScroll(element);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointermove(pointer(100, 10));
    handlers.pointerup(pointer(100, 20));

    const dragClick = click();
    handlers.clickCapture(dragClick);
    expect(dragClick.stopPropagation).toHaveBeenCalled();

    const nextClick = click();
    handlers.clickCapture(nextClick);
    expect(nextClick.stopPropagation).not.toHaveBeenCalled();
  });

  it('lets a plain click through', () => {
    const element = createElement();
    const { handlers } = useDragScroll(element);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointerup(pointer(200, 50));

    const event = click();
    handlers.clickCapture(event);

    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  });

  it('glides on with the drag velocity after a quick release', () => {
    const element = createElement();
    const { handlers } = useDragScroll(element);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointermove(pointer(100, 10));
    handlers.pointerup(pointer(100, 20));

    expect(start).toHaveBeenCalledWith(10);
  });

  it('does not glide when the pointer rested before release', () => {
    const element = createElement();
    const { handlers } = useDragScroll(element);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointermove(pointer(100, 10));
    handlers.pointerup(pointer(100, 500));

    expect(start).not.toHaveBeenCalled();
  });

  it('ends the drag without a glide or click swallowing when released outside', () => {
    const element = createElement();
    const { handlers, isDragging } = useDragScroll(element);

    handlers.pointerdown(pointer(200, 0));
    handlers.pointermove(pointer(100, 10));
    handlers.pointermove(pointer(100, 20, 0));

    const event = click();
    handlers.clickCapture(event);

    expect(isDragging.value).toBe(false);
    expect(start).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('overscrolls with friction at an edge and snaps back on release', () => {
    const element = createElement(0);
    const { handlers, overscrollOffset } = useDragScroll(element);

    handlers.pointerdown(pointer(0, 0));
    handlers.pointermove(pointer(100, 10));

    expect(element.value.scrollLeft).toBe(0);
    expect(overscrollOffset.value).toBe(-40);

    handlers.pointerup(pointer(100, 20));
    expect(overscrollOffset.value).toBe(0);
  });

  it('pulls overscroll back 1:1 without crossing to the other side', () => {
    const element = createElement(0);
    const { handlers, overscrollOffset } = useDragScroll(element);

    handlers.pointerdown(pointer(0, 0));
    handlers.pointermove(pointer(100, 10));
    handlers.pointermove(pointer(80, 20));
    expect(overscrollOffset.value).toBe(-20);

    handlers.pointermove(pointer(0, 30));
    expect(overscrollOffset.value).toBe(0);
  });
});
