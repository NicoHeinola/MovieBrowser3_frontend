import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';

import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { canAutoplaySound } from '@/utils/media/canAutoplaySound';
import MediaBanner from '../MediaBanner.vue';

vi.mock('@/utils/media/canAutoplaySound', () => ({ canAutoplaySound: vi.fn() }));

// VImg polls on a timer that only unmounting clears, and it would otherwise fire after jsdom is torn down.
enableAutoUnmount(afterEach);

const video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/**
 * Mounts the banner with a video that has started playing.
 * @param props - Props on top of an image and a video.
 * @returns The mounted banner.
 */
const mountPlaying = async (props: Record<string, unknown> = {}) => {
  const wrapper = mount(MediaBanner, {
    props: { imageSrc: 'a.jpg', videoSrc: video, ...props },
    global: { plugins: [createVuetify()], stubs: { YouTubePlayer: true, VolumeControl: true } },
  });

  wrapper.findComponent(YouTubePlayer).vm.$emit('playing');
  await wrapper.vm.$nextTick();

  return wrapper;
};

describe('MediaBanner', () => {
  beforeEach(() => {
    vi.mocked(canAutoplaySound).mockReturnValue(true);
  });

  it('hides the image while the video plays', async () => {
    const wrapper = await mountPlaying();

    expect(wrapper.find('.v-img').exists()).toBe(false);
  });

  it('keeps the video on top when only the image changes', async () => {
    const wrapper = await mountPlaying();

    await wrapper.setProps({ imageSrc: 'b.jpg' });

    expect(wrapper.find('.v-img').exists()).toBe(false);
  });

  it('shows the image again while a new video loads', async () => {
    const wrapper = await mountPlaying();

    await wrapper.setProps({ videoSrc: 'https://www.youtube.com/watch?v=9bZkp7q19f0' });

    expect(wrapper.find('.v-img').exists()).toBe(true);
  });

  it('keeps the video muted without a volume control', async () => {
    const wrapper = await mountPlaying({ muted: false });

    expect(wrapper.findComponent(VolumeControl).exists()).toBe(false);
    expect(wrapper.findComponent(YouTubePlayer).props('muted')).toBe(true);
  });

  it('saves a mute from the volume control', async () => {
    const wrapper = await mountPlaying({ muted: false, showVolumeControl: true });

    wrapper.findComponent(VolumeControl).vm.$emit('update:muted', true);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:muted')).toEqual([[true]]);
  });

  it('plays with the given sound once the volume control is shown', async () => {
    const wrapper = await mountPlaying({ muted: false, volume: 65, showVolumeControl: true });

    expect(wrapper.findComponent(VolumeControl).exists()).toBe(true);
    expect(wrapper.findComponent(YouTubePlayer).props()).toMatchObject({ muted: false, volume: 65 });
  });

  it('starts muted while the browser blocks sound, until the user turns it on', async () => {
    vi.mocked(canAutoplaySound).mockReturnValue(false);
    const wrapper = await mountPlaying({ muted: false, showVolumeControl: true });

    expect(wrapper.findComponent(YouTubePlayer).props('muted')).toBe(true);
    expect(wrapper.findComponent(VolumeControl).props('muted')).toBe(true);

    wrapper.findComponent(VolumeControl).vm.$emit('update:muted', false);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(YouTubePlayer).props('muted')).toBe(false);
    expect(wrapper.findComponent(VolumeControl).props('muted')).toBe(false);
  });
});
