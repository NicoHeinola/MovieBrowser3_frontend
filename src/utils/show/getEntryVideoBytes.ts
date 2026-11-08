import type { Episode } from '@/interfaces/api/models/Episode';

/** The fields this needs, shared by saved entries and the edit dialog's form data. */
interface EntryVideoSizes {
  episodes?: Pick<Partial<Episode>, 'has_video_file' | 'video_file_size'>[];
}

/**
 * Adds up the measured video files of an entry's episodes.
 * @param entry - The saved entry or entry form data.
 * @returns The total in bytes; episodes without a file or a measured size count as 0.
 */
export const getEntryVideoBytes = (entry: EntryVideoSizes): number =>
  (entry.episodes ?? []).reduce(
    (sum, episode) => sum + (episode.has_video_file ? (episode.video_file_size ?? 0) : 0),
    0,
  );
