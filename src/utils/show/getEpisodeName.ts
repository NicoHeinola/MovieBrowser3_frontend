import type { Episode } from '@/interfaces/api/models/Episode';

/**
 * Get an episode's display name, falling back to its 1-based position.
 *
 * @param episode The episode to name.
 * @returns The episode name, or "Episode N" when it has none.
 */
export const getEpisodeName = (episode: Episode): string => {
  if (episode.name) {
    return episode.name;
  }

  return `Episode ${episode.sequence_number + 1}`;
};
