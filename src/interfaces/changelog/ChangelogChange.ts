import type { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/** One line in a changelog entry. */
export interface ChangelogChange {
  /** What kind of change it is. */
  type: ChangelogChangeType;
  /** User-facing description of the change. */
  text: string;
}
