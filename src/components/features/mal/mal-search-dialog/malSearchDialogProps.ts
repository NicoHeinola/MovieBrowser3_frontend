import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { MalAnime } from '@/interfaces/api/models/MalAnime';

/** The MyAnimeList search dialog's props; it closes with the picked anime, or nothing when cancelled. */
export interface MalSearchDialogProps extends DialogComponentProps<MalAnime> {
  /** The name to search for straight away, such as the show's title. */
  initialSearch?: string;
}
