import type { Episode } from '@/interfaces/api/models/Episode';

export const getEpisodeName = (episode: Episode): string => {
  if (episode.name) {
    return episode.name;
  }

  return `Episode ${episode.sequence_number}`;
};
