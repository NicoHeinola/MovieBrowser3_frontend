import type { YouTubeNamespace } from './youTubeNamespace';

export interface YouTubeWindow extends Window {
  YT?: YouTubeNamespace;
  onYouTubeIframeAPIReady?: () => void;
}
