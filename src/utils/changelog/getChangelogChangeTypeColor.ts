import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

const changeTypeColors: Record<ChangelogChangeType, string> = {
  [ChangelogChangeType.Added]: 'success',
  [ChangelogChangeType.Changed]: 'info',
  [ChangelogChangeType.Fixed]: 'warning',
  [ChangelogChangeType.Removed]: 'error',
};

/**
 * Resolves the theme color that represents a changelog change type.
 * @param type - The change type to look up.
 * @returns The Vuetify theme color name for the type.
 */
export const getChangelogChangeTypeColor = (type: ChangelogChangeType): string => {
  return changeTypeColors[type];
};
