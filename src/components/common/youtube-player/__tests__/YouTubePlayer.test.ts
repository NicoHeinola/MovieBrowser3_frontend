import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import YouTubePlayer from '../YouTubePlayer.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

enableAutoUnmount(afterEach);

/** The player state the fake API reports while a video plays. */
const PLAYING = 1;

const player = {
  destroy: vi.fn(),
  mute: vi.fn(),
  playVideo: vi.fn(),
  setVolume: vi.fn(),
  unMute: vi.fn(),
};

let events: YT.Events = {};

/**
 * Sets whether the page counts as hidden, as when another tab is in front, and tells listeners about it.
 * @param isHidden - Whether the page is hidden.
 */
const setHidden = (isHidden: boolean): void => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: isHidden ? 'hidden' : 'visible' });
  document.dispatchEvent(new Event('visibilitychange'));
};

/**
 * Mounts the player, makes it ready and lets it start playing.
 * @param props - Props on top of the video id.
 * @returns The mounted player.
 */
const mountPlaying = (props: { muted?: boolean } = {}) => {
  const wrapper = mount(YouTubePlayer, { props: { videoId: 'abc', ...props }, attachTo: document.body });

  const target = player as unknown as YT.Player;
  events.onReady?.({ target } as YT.PlayerEvent);
  events.onStateChange?.({ target, data: PLAYING } as YT.OnStateChangeEvent);

  return wrapper;
};

describe('YouTubePlayer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    events = {};
    // The fake API keeps the player's callbacks so each test can drive them.
    vi.stubGlobal('YT', {
      Player: vi.fn(function (_id: string, options: YT.PlayerOptions) {
        events = options.events ?? {};
        return player;
      }),
      PlayerState: { PLAYING },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setHidden(false);
  });

  it('starts muted and turns the sound on once the video plays', () => {
    const wrapper = mountPlaying({ muted: false });

    expect(player.mute).toHaveBeenCalledBefore(player.playVideo);
    expect(player.unMute).toHaveBeenCalledOnce();
    expect(wrapper.emitted('playing')).toHaveLength(1);
  });

  it('stays muted when asked', () => {
    mountPlaying({ muted: true });

    expect(player.unMute).not.toHaveBeenCalled();
  });

  it('mutes while the page is hidden and restores the sound when it is shown again', async () => {
    const wrapper = mountPlaying({ muted: false });
    player.mute.mockClear();
    player.unMute.mockClear();

    setHidden(true);
    await wrapper.vm.$nextTick();
    expect(player.mute).toHaveBeenCalledOnce();

    setHidden(false);
    await wrapper.vm.$nextTick();
    expect(player.unMute).toHaveBeenCalledOnce();
  });
});
