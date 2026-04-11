import type { ConfirmDialogProps } from '@/components/common/confirm-dialog';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';

export const useConfirmDialog = () => {
  const dialog = useDialog();

  const confirm = async (props: Omit<ConfirmDialogProps, 'close' | 'modelValue'>): Promise<boolean> => {
    const isConfirmed = await dialog.showDialog<boolean, Omit<ConfirmDialogProps, 'close' | 'modelValue'>>({
      component: ConfirmDialog,
      props,
    });

    return isConfirmed ?? false;
  };

  return {
    confirm,
  };
};
