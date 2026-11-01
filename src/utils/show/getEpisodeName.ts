import type { Episode } from '@/interfaces/api/models/Episode';
import { i18n } from '@/plugins/i18n';

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

  return i18n.global.t('show.episodeFallback', { number: episode.sequence_number + 1 });
};
