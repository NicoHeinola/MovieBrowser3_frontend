/**
 * Formats a time like a media player: `m:ss`, or `h:mm:ss` from an hour up, for playback positions and countdowns.
 * @param seconds - The time in seconds.
 * @returns The formatted time.
 */
export const formatDuration = (seconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secondsPart = String(totalSeconds % 60).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${secondsPart}`;
  }

  return `${minutes}:${secondsPart}`;
};
