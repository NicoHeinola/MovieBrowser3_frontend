import type { BaseDialogProps } from '@/components/common/base-dialog';
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

export interface ConfirmDialogProps extends BaseDialogProps, Omit<DialogComponentProps<boolean>, 'modelValue'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}
