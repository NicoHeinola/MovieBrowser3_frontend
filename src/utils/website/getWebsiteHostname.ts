/**
 * Gets the readable host of a website URL, without a leading `www.`.
 * @param url - The website URL.
 * @returns The hostname, or the URL as-is when it cannot be parsed.
 */
export const getWebsiteHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
};
