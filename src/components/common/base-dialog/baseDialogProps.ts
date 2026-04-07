import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

export interface BaseDialogProps extends Pick<DialogComponentProps<unknown>, 'modelValue'> {
  maxWidth?: string | number;
  persistent?: boolean;
}
