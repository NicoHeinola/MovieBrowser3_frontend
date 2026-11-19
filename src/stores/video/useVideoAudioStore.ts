import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * The user's sound choice for preview videos, remembered in this browser and shared by every player with a volume
 * control. Automatic mutes, such as the one when playback starts, stay with the component that applies them.
 */
export const useVideoAudioStore = defineStore('videoAudio', () => {
  /** Volume from 0 to 100. */
  const volume = useStorage<number>('videoAudio.volume', 20);
  /** Whether the user muted the sound. Videos start muted until the user turns the sound on. */
  const isMuted = useStorage<boolean>('videoAudio.isMuted', true);
  /** How many previews play in front of the page right now, such as in an open show drawer. */
  const foregroundCount = ref<number>(0);

  /** Whether a preview plays in front of the page, so videos behind it should stop and leave it the sound. */
  const hasForegroundPreview = computed<boolean>(() => foregroundCount.value > 0);

  /**
   * Marks a preview that plays in front of the page until the returned function releases it.
   * @returns Releases the claim. Calling it again does nothing, so cleanup paths may overlap.
   */
  const claimForeground = (): (() => void) => {
    foregroundCount.value++;
    let isReleased = false;

    return (): void => {
      if (isReleased) return;

      isReleased = true;
      foregroundCount.value--;
    };
  };

  return {
    volume,
    isMuted,
    hasForegroundPreview,
    claimForeground,
  };
});
