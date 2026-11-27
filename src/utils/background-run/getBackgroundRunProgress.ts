import { i18n } from '@/plugins/i18n';

/** How far a run through the episodes is, for a status card. */
export interface BackgroundRunProgress {
  /** The percentage done, or null while the run still counts the episodes. */
  progress: number | null;
  /** Such as `12 of 40 episodes`. */
  progressText: string;
}

/**
 * Tells how far a run through the episodes is.
 * @param done - The episodes done so far.
 * @param total - All episodes of the run, 0 while the run still counts them.
 * @returns The percentage and its text.
 */
export const getBackgroundRunProgress = (done: number, total: number): BackgroundRunProgress => {
  const { t } = i18n.global;

  if (total === 0) {
    return { progress: null, progressText: t('settings.countingEpisodes') };
  }

  return { progress: Math.round((done / total) * 100), progressText: t('settings.episodeProgress', { done, total }) };
};
