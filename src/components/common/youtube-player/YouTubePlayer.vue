<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

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

const playerContainerRef = ref<HTMLDivElement | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ytPlayer: any = null;

const createPlayer = () => {
  const container = playerContainerRef.value;
  if (!container) return;

  ytPlayer?.destroy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ytPlayer = new (window as any).YT.Player(container, {
    videoId: props.videoId,
    playerVars: {
      autoplay: props.autoplay ? 1 : 0,
      mute: props.muted ? 1 : 0,
      controls: props.controls ? 1 : 0,
      loop: props.loop ? 1 : 0,
      playlist: props.videoId,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      disablekb: props.controls ? 0 : 1,
    },
    events: {
      // Reload video in onReady so onError fires reliably on initial load
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onReady: (event: any) => {
        event.target.setVolume(props.volume);
        if (props.muted) {
          event.target.mute();
        } else {
          event.target.unMute();
        }
        if (props.autoplay) {
          event.target.loadVideoById(props.videoId);
        }
      },
      onError: () => {
        emit('error');
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStateChange: (event: any) => {
        if (event.data === 1 /* YT.PlayerState.PLAYING */) {
          emit('playing');
        }
      },
    },
  });
};

const initYTApi = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).YT?.Player) {
    createPlayer();
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prev = (window as any).onYouTubeIframeAPIReady;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).onYouTubeIframeAPIReady = () => {
    prev?.();
    createPlayer();
  };
  if (!document.querySelector('#yt-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.append(tag);
  }
};

watch(playerContainerRef, (container) => {
  if (container) initYTApi();
});

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

onUnmounted(() => {
  ytPlayer?.destroy();
  ytPlayer = null;
});
</script>

<template>
  <div class="player-root">
    <div class="player-container" ref="playerContainerRef"></div>
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
