import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createVuetify } from 'vuetify';

import { YouTubePlayer } from '@/components/common/youtube-player';
import MediaBanner from '../MediaBanner.vue';

const video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/**
 * Mounts the banner with a video that has started playing.
 * @returns The mounted banner.
 */
const mountPlaying = async () => {
  const wrapper = mount(MediaBanner, {
    props: { imageSrc: 'a.jpg', videoSrc: video },
    global: { plugins: [createVuetify()], stubs: { YouTubePlayer: true } },
  });

  wrapper.findComponent(YouTubePlayer).vm.$emit('playing');
  await wrapper.vm.$nextTick();

  return wrapper;
};

describe('MediaBanner', () => {
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
});
