import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive } from 'vue';

import { useShowDrawerStore } from '../useShowDrawerStore';

const action = { render: () => null };

describe('useShowDrawerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts closed without a show', () => {
    const store = useShowDrawerStore();

    expect(store.showId).toBeNull();
    expect(store.isShown).toBe(false);
    expect(store.action).toBeNull();
  });

  it('opens a show', () => {
    const store = useShowDrawerStore();

    store.open(4);

    expect(store.showId).toBe(4);
    expect(store.isShown).toBe(true);
    expect(store.action).toBeNull();
  });

  it('keeps the action as given, without making it reactive', () => {
    const store = useShowDrawerStore();

    store.open(4, { action });

    expect(store.action).toBe(action);
    expect(isReactive(store.action)).toBe(false);
  });

  it('drops the action when another show is opened without one', () => {
    const store = useShowDrawerStore();
    store.open(4, { action });

    store.open(7);

    expect(store.showId).toBe(7);
    expect(store.action).toBeNull();
  });

  it('keeps the action when the drawer switches to another show', () => {
    const store = useShowDrawerStore();
    store.open(4, { action });

    store.showId = 7;

    expect(store.showId).toBe(7);
    expect(store.action).toBe(action);
  });

  it('closes without losing the show, so the content stays while the drawer slides out', () => {
    const store = useShowDrawerStore();
    store.open(4, { action });

    store.close();

    expect(store.showId).toBe(4);
    expect(store.isShown).toBe(false);
    expect(store.action).toBeNull();
  });
});
