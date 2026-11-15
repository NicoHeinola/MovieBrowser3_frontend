/** What a background task is doing, or how it last ended, as the task status card shows it. */
export interface TaskStatus {
  /** Sets the icon and bar color. */
  type: 'error' | 'info' | 'success' | 'warning';
  icon: string;
  title: string;
  /** A second line under the title, such as the target folder or why the task failed. */
  text?: string;
  /** Shows the progress bar, which moves without a percent while `progress` is unknown. */
  running?: boolean;
  /** Percent done, or `null` while the total is unknown. */
  progress?: number | null;
  /** The count beside the title, such as "32 of 173 episodes". */
  progressText?: string;
}

/** Props of the task status card. */
export interface TaskStatusCardProps extends TaskStatus {
  /** Shows a skeleton while the status loads. */
  loading?: boolean;
}
