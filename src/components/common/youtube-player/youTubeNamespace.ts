import type { YouTubePlayerInstance } from './youTubePlayerInstance';
import type { YouTubePlayerOptions } from './youTubePlayerOptions';

export interface YouTubePlayerConstructor {
  new (elementId: string, options: YouTubePlayerOptions): YouTubePlayerInstance;
}

export interface YouTubeNamespace {
  Player: YouTubePlayerConstructor;
  PlayerState?: {
    PLAYING: number;
  };
}
