import type { YouTubePlayerConstructor } from './youTubePlayerConstructor';

export interface YouTubeNamespace {
  Player: YouTubePlayerConstructor;
  PlayerState?: {
    PLAYING: number;
  };
}
