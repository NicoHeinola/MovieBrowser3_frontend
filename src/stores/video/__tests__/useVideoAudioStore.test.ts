import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { useVideoAudioStore } from '../useVideoAudioStore';

describe('useVideoAudioStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('starts muted at volume 20 when nothing is stored', () => {
    const store = useVideoAudioStore();

    expect(store.volume).toBe(20);
    expect(store.isMuted).toBe(true);
  });

  it('remembers the volume and mute choice for the next page load', async () => {
    const store = useVideoAudioStore();
    store.volume = 65;
    store.isMuted = false;
    await nextTick();

    // A fresh Pinia stands in for reloading the page.
    setActivePinia(createPinia());
    const reloadedStore = useVideoAudioStore();

    expect(reloadedStore.volume).toBe(65);
    expect(reloadedStore.isMuted).toBe(false);
  });

  it('has a foreground preview until every claim is released', () => {
    const store = useVideoAudioStore();
    const releaseFirst = store.claimForeground();
    const releaseSecond = store.claimForeground();

    releaseFirst();
    // Releasing twice must not drop the other drawer's claim.
    releaseFirst();
    expect(store.hasForegroundPreview).toBe(true);

    releaseSecond();
    expect(store.hasForegroundPreview).toBe(false);
  });
});
