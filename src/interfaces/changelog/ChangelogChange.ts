import type { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/** One line in a changelog entry. */
export interface ChangelogChange {
  /** What kind of change it is. */
  type: ChangelogChangeType;
  /** User-facing description of the change. */
  text: string;
  /** Optional sub-points that explain the change, so related lines share one bullet instead of repeating its subject. */
  details?: string[];
}
