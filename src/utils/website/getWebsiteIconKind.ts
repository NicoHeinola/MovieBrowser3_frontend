import { WebsiteIconKind } from '@/enums/website/WebsiteIconKind';

/**
 * Decides how a website's saved icon value should be rendered.
 * @param icon - The saved icon value.
 * @returns Image for http(s) URLs, Mdi for any other value, and Favicon when nothing is saved.
 */
export const getWebsiteIconKind = (icon: string | null | undefined): WebsiteIconKind => {
  const trimmedIcon = icon?.trim() ?? '';

  if (!trimmedIcon) {
    return WebsiteIconKind.Favicon;
  }

  if (/^https?:\/\//i.test(trimmedIcon)) {
    return WebsiteIconKind.Image;
  }

  return WebsiteIconKind.Mdi;
};
