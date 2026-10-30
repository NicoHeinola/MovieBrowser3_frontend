export interface YouTubePlayerInstance {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
}
