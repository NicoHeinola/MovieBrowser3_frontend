import type { Episode } from '@/interfaces/api/models/Episode';

/** The episode fields that decide this, shared by saved episodes and the edit dialog's form data. */
interface EpisodeVideoState {
  id?: Episode['id'];
  file?: File | null;
  filename?: Episode['filename'];
  has_video_file?: Episode['has_video_file'];
}

/**
 * Tells whether an episode has no video file to play.
 *
 * @param episode The saved episode or episode form data to check.
 * @returns True when no file is picked and a saved episode has none either.
 */
export const isEpisodeVideoMissing = (episode: EpisodeVideoState): boolean => {
  // A picked file replaces whatever is on disk once saved, so it counts as present.
  if (episode.file) {
    return false;
  }

  // An unsaved episode has nothing on disk yet, and its filename may be left over from a cleared pick.
  if (!episode.id) {
    return true;
  }

  // Saved episodes carry the flag the backend keeps up to date.
  return !episode.filename || episode.has_video_file === false;
};
