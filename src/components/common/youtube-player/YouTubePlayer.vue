<script setup lang="ts">
import type { YouTubePlayerInstance } from './youTubePlayerInstance';
import type { YouTubeWindow } from './youTubeWindow';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

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

let ytPlayer: YouTubePlayerInstance | null = null;

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

        if (props.muted) {
          event.target.mute();
        } else {
          event.target.unMute();
        }

        if (props.autoplay) {
          event.target.playVideo();
        }
      },
      onError: () => {
        emit('error');
      },
      onStateChange: (event) => {
        const playingState = youtubeWindow.YT?.PlayerState?.PLAYING ?? 1;

        if (event.data === playingState) {
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

watch(
  () => props.muted,
  (muted) => {
    if (!ytPlayer) return;

    if (muted) {
      ytPlayer.mute();
      return;
    }

    ytPlayer.unMute();
  },
);

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
      class="player-container"
      frameborder="0"
      title="Show preview video"
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
