/**
 * Gets the conventional `/favicon.ico` address of a website, loaded straight from the site itself.
 * @param url - The website URL.
 * @returns The favicon URL, or null when the URL cannot be parsed.
 */
export const getWebsiteFaviconUrl = (url: string): string | null => {
  try {
    return new URL('/favicon.ico', url).href;
  } catch {
    return null;
  }
};
