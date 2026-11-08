import type { EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';

import { useScrollSpy } from '../useScrollSpy';

const scopes: EffectScope[] = [];

/**
 * Adds sections to the page whose tops sit at the given distances from the top of the viewport.
 * @param tops - The top of each section, by id.
 * @returns Nothing.
 */
const addSections = (tops: Record<string, number>): void => {
  for (const [id, top] of Object.entries(tops)) {
    const section = document.createElement('section');
    section.id = id;
    section.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.append(section);
  }
};

/**
 * Runs the scroll spy in its own effect scope.
 * @returns The scroll spy state.
 */
const setupSpy = () => {
  const scope = effectScope();
  scopes.push(scope);

  return scope.run(() => useScrollSpy(['first', 'second', 'third'], 88))!;
};

describe('useScrollSpy', () => {
  beforeEach(() => {
    vi.stubGlobal('innerHeight', 1000);
    vi.stubGlobal('scrollY', 0);
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('marks the last section scrolled past the line in the upper part of the window', () => {
    addSections({ first: -800, second: 200, third: 900 });
    const { activeSectionId, updateActiveSection } = setupSpy();

    updateActiveSection();

    expect(activeSectionId.value).toBe('second');
  });

  it('keeps the first of two sections side by side marked, as they share a top', () => {
    addSections({ first: -800, second: -800, third: 900 });
    const { activeSectionId, updateActiveSection } = setupSpy();

    updateActiveSection();

    expect(activeSectionId.value).toBe('first');
  });

  it('marks the last section at the bottom of the page, where it can never reach the line', () => {
    addSections({ first: -2000, second: -1000, third: 600 });
    vi.stubGlobal('scrollY', 4000);
    const { activeSectionId, updateActiveSection } = setupSpy();

    updateActiveSection();

    expect(activeSectionId.value).toBe('third');
  });

  it('keeps a picked section marked while the page scrolls to it, until the scroll ends', () => {
    addSections({ first: 0, second: 1200, third: 2400 });
    const { activeSectionId, scrollToSection } = setupSpy();

    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    scrollToSection('second');
    // The section stops below the fixed bars: 1200px down, minus the 88px offset.
    expect(scrollTo).toHaveBeenCalledWith({ top: 1112, behavior: 'smooth' });
    expect(activeSectionId.value).toBe('second');

    // Midway the first section is still the one past the line, but the pick wins.
    window.dispatchEvent(new Event('scroll'));
    expect(activeSectionId.value).toBe('second');

    window.dispatchEvent(new Event('scrollend'));
    window.dispatchEvent(new Event('scroll'));
    expect(activeSectionId.value).toBe('first');
  });
});
