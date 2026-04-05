export interface YouTubePlayerInstance {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  mute: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
}
