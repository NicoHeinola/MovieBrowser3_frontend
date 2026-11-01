import type { YouTubePlayerVars } from './youTubePlayerVars';
import type { YouTubeReadyEvent } from './youTubeReadyEvent';
import type { YouTubeStateChangeEvent } from './youTubeStateChangeEvent';

export interface YouTubePlayerOptions {
  events: {
    onError: () => void;
    onReady: (event: YouTubeReadyEvent) => void;
    onStateChange: (event: YouTubeStateChangeEvent) => void;
  };
  playerVars?: YouTubePlayerVars;
  videoId?: string;
}
