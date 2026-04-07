import type { SnackbarOptions } from './SnackbarOptions';

export type SnackbarPresetOptions = Omit<SnackbarOptions, 'message' | 'color'>;
