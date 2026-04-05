import { describe, expect, it } from 'vitest';
import { captureComponentEl } from '../captureComponentEl';

describe('captureComponentEl', () => {
  it('should store an HTMLElement directly', () => {
    const els: HTMLElement[] = [];
    const el = document.createElement('div');

    captureComponentEl(els, el, 0);

    expect(els[0]).toBe(el);
  });

  it('should unwrap a Vue component ref with $el', () => {
    const els: HTMLElement[] = [];
    const inner = document.createElement('span');
    const vueRef = { $el: inner };

    captureComponentEl(els, vueRef, 1);

    expect(els[1]).toBe(inner);
  });

  it('should store at the correct index', () => {
    const els: HTMLElement[] = [];
    const el0 = document.createElement('div');
    const el2 = document.createElement('p');

    captureComponentEl(els, el0, 0);
    captureComponentEl(els, el2, 2);

    expect(els[0]).toBe(el0);
    expect(els[1]).toBeUndefined();
    expect(els[2]).toBe(el2);
  });

  it('should not modify els when el is null', () => {
    const els: HTMLElement[] = [];

    captureComponentEl(els, null, 0);

    expect(els[0]).toBeUndefined();
  });

  it('should not modify els when el is undefined', () => {
    const els: HTMLElement[] = [];

    captureComponentEl(els, undefined, 0);

    expect(els[0]).toBeUndefined();
  });
});
