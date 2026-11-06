import type { BannerPreviewDialogProps } from '@/components/features/show/banner-preview-dialog';

import { BannerPreviewDialog } from '@/components/features/show/banner-preview-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';

/**
 * Opens a preview of how an image and a video look on the home page banner.
 * @returns The function that opens the preview.
 */
export const useBannerPreviewDialog = () => {
  const dialog = useDialog();

  /**
   * Opens the preview and waits until it closes.
   * @param props - The image and video to preview.
   * @returns A promise that resolves when the preview closes.
   */
  const showBannerPreview = async (props: Omit<BannerPreviewDialogProps, 'close' | 'modelValue'>): Promise<void> => {
    await dialog.showDialog<void, Omit<BannerPreviewDialogProps, 'close' | 'modelValue'>>({
      component: BannerPreviewDialog,
      props,
    });
  };

  return {
    showBannerPreview,
  };
};
