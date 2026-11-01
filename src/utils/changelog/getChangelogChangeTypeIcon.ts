import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

const changeTypeIcons: Record<ChangelogChangeType, string> = {
  [ChangelogChangeType.Added]: 'mdi-plus-circle-outline',
  [ChangelogChangeType.Changed]: 'mdi-swap-horizontal-circle-outline',
  [ChangelogChangeType.Fixed]: 'mdi-wrench-outline',
  [ChangelogChangeType.Removed]: 'mdi-minus-circle-outline',
};

/**
 * Resolves the icon that represents a changelog change type.
 * @param type - The change type to look up.
 * @returns The MDI icon name for the type.
 */
export const getChangelogChangeTypeIcon = (type: ChangelogChangeType): string => {
  return changeTypeIcons[type];
};
