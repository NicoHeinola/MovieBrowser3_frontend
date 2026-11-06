import { describe, expect, it, vi } from 'vitest';

import { BannerPreviewDialog } from '@/components/common/banner-preview-dialog';
import { useBannerPreviewDialog } from '../useBannerPreviewDialog';

const showDialog = vi.fn();

vi.mock('@/components/layouts/dialog-provider', () => ({ useDialog: () => ({ showDialog }) }));

describe('useBannerPreviewDialog', () => {
  it('opens the preview dialog with the media', async () => {
    await useBannerPreviewDialog().showBannerPreview({ imageSrc: 'a.jpg' });

    expect(showDialog).toHaveBeenCalledWith({ component: BannerPreviewDialog, props: { imageSrc: 'a.jpg' } });
  });
});
