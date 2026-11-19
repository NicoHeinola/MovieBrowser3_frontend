<script setup lang="ts">
import type { YouTubeWindow } from './youTubeWindow';
import { useDocumentVisibility } from '@vueuse/core';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    videoId: string;
    muted?: boolean;
    volume?: number;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
  }>(),
  {
    muted: true,
    volume: 100,
    autoplay: true,
    controls: false,
    loop: true,
  },
);

const emit = defineEmits<{
  playing: [];
  error: [];
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeId = `yt-player-${Math.random().toString(36).slice(2, 11)}`;

let ytPlayer: YT.Player | null = null;

const visibility = useDocumentVisibility();

/** Muted as asked, and also while the page is hidden, so a looping preview doesn't keep playing sound in another tab. */
const isMuted = computed<boolean>(() => props.muted || visibility.value === 'hidden');

const playerSrc = computed<string>(() => {
  const params = new URLSearchParams({
    autoplay: '0',
    controls: props.controls ? '1' : '0',
    disablekb: props.controls ? '0' : '1',
    enablejsapi: '1',
    iv_load_policy: '3',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
  });

  if (props.loop) {
    params.set('loop', '1');
    params.set('playlist', props.videoId);
  }

  if (typeof window !== 'undefined') {
    params.set('origin', window.location.origin);
  }

  return `https://www.youtube.com/embed/${props.videoId}?${params.toString()}`;
});

const getYouTubeWindow = (): YouTubeWindow => window as YouTubeWindow;

const createPlayer = () => {
  if (!iframeRef.value) return;

  const youtubeWindow = getYouTubeWindow();
  if (!youtubeWindow.YT?.Player) return;

  ytPlayer?.destroy();
  ytPlayer = new youtubeWindow.YT.Player(iframeId, {
    playerVars: {
      autoplay: props.autoplay ? 1 : 0,
      controls: props.controls ? 1 : 0,
      disablekb: props.controls ? 0 : 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      loop: props.loop ? 1 : 0,
      origin: window.location.origin,
      ...(props.loop ? { playlist: props.videoId } : {}),
      playsinline: 1,
      rel: 0,
    },
    videoId: props.videoId,
    events: {
      onReady: (event) => {
        event.target.setVolume(props.volume);

        // Start muted, which browsers always allow: a video they block from starting with sound would not start at all,
        // and its volume control only shows once it plays. The sound comes on once it plays.
        event.target.mute();

        if (props.autoplay) {
          event.target.playVideo();
          return;
        }

        if (!isMuted.value) {
          event.target.unMute();
        }
      },
      onError: () => {
        emit('error');
      },
      onStateChange: (event) => {
        const playingState = youtubeWindow.YT?.PlayerState?.PLAYING ?? 1;

        if (event.data === playingState) {
          // Apply the wanted sound now that it plays; repeating it on each loop is harmless.
          if (!isMuted.value) {
            event.target.unMute();
          }

          emit('playing');
        }
      },
    },
  });
};

const initYTApi = () => {
  const youtubeWindow = getYouTubeWindow();

  if (youtubeWindow.YT?.Player) {
    createPlayer();
    return;
  }

  const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
  youtubeWindow.onYouTubeIframeAPIReady = () => {
    previousReady?.();
    createPlayer();
  };

  if (!document.querySelector('#yt-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.append(tag);
  }
};

watch(isMuted, (muted) => {
  if (!ytPlayer) return;

  if (muted) {
    ytPlayer.mute();
    // A browser may pause a video it won't let play sound; muting lets it play again.
    if (props.autoplay) {
      ytPlayer.playVideo();
    }
    return;
  }

  ytPlayer.unMute();
});

watch(
  () => props.volume,
  (volume) => {
    if (!ytPlayer) return;
    ytPlayer.setVolume(volume);
  },
);

onMounted(() => {
  initYTApi();
});

onUnmounted(() => {
  ytPlayer?.destroy();
  ytPlayer = null;
});
</script>

<template>
  <div class="player-root">
    <iframe
      :src="playerSrc"
      :title="t('common.showPreviewVideo')"
      allow="autoplay; encrypted-media; picture-in-picture"
      class="player-container"
      frameborder="0"
      allowfullscreen
      :id="iframeId"
      ref="iframeRef"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
.player-root {
  position: absolute;
  inset: 0;
}

.player-container {
  width: 100%;
  height: 100%;
}
</style>
