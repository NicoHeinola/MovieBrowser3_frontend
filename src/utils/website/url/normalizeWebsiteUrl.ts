/**
 * Adds `https://` to a URL typed without a scheme, so `example.com` becomes a valid address.
 * @param url - The URL as entered.
 * @returns The trimmed URL, with `https://` prepended when it has no scheme.
 */
export const normalizeWebsiteUrl = (url: string): string => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl || /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, '')}`;
};
