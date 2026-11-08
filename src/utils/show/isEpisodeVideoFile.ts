import { episodeVideoFileExtensions } from './episodeVideoFileExtensions';

/**
 * Whether a file can be an episode's video, judged by its extension or its video MIME type.
 *
 * @param file The file, e.g. one dropped from a file explorer.
 * @returns True for video files.
 */
export const isEpisodeVideoFile = (file: Pick<File, 'name' | 'type'>): boolean => {
  const name = file.name.toLowerCase();

  return file.type.startsWith('video/') || episodeVideoFileExtensions.some((extension) => name.endsWith(extension));
};
