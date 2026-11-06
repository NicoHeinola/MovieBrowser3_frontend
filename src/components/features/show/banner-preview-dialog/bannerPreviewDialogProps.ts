import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

/** Props of the banner preview dialog: the media to show as it would appear on the home page. */
export interface BannerPreviewDialogProps extends DialogComponentProps {
  /** The image to show. */
  imageSrc?: string | null;
  /** The YouTube url to play. */
  videoSrc?: string | null;
}
