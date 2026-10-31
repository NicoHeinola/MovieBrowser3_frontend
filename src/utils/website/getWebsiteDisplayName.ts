import type { Website } from '@/interfaces/api/models/Website';

import { getWebsiteHostname } from './getWebsiteHostname';

/**
 * Gets the name a website is shown with.
 * @param website - The website.
 * @returns The title, or the hostname when the website has no title.
 */
export const getWebsiteDisplayName = (website: Pick<Website, 'title' | 'url'>): string => {
  return website.title?.trim() || getWebsiteHostname(website.url);
};
