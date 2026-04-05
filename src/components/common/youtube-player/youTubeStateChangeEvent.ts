import type { YouTubeReadyEvent } from './youTubeReadyEvent';

export interface YouTubeStateChangeEvent extends YouTubeReadyEvent {
  data: number;
}
