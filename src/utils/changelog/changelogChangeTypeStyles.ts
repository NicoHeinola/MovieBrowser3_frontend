import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/** How each changelog change type looks: its theme color and its MDI icon. */
export const CHANGELOG_CHANGE_TYPE_STYLES: Record<ChangelogChangeType, { color: string; icon: string }> = {
  [ChangelogChangeType.Added]: { color: 'success', icon: 'mdi-plus-circle-outline' },
  [ChangelogChangeType.Changed]: { color: 'info', icon: 'mdi-swap-horizontal-circle-outline' },
  [ChangelogChangeType.Fixed]: { color: 'warning', icon: 'mdi-wrench-outline' },
  [ChangelogChangeType.Removed]: { color: 'error', icon: 'mdi-minus-circle-outline' },
};
