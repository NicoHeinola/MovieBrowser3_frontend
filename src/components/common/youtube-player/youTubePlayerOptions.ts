import type { YouTubeReadyEvent } from './youTubeReadyEvent';
import type { YouTubeStateChangeEvent } from './youTubeStateChangeEvent';

export interface YouTubePlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  iv_load_policy?: 1 | 3;
  loop?: 0 | 1;
  origin?: string;
  playlist?: string;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
}

export interface YouTubePlayerOptions {
  events: {
    onError: () => void;
    onReady: (event: YouTubeReadyEvent) => void;
    onStateChange: (event: YouTubeStateChangeEvent) => void;
  };
  playerVars?: YouTubePlayerVars;
  videoId?: string;
}
