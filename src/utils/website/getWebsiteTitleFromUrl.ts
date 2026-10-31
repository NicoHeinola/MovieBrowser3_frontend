/** Domain endings sites tend to use as part of their name, such as tetr.io, so they stay in the title. */
const NAME_LIKE_ENDINGS = new Set(['io', 'ai', 'gg', 'tv', 'fm']);

/** Second-level labels of country domains such as bbc.co.uk, which are dropped along with the country. */
const COUNTRY_SECOND_LEVELS = new Set(['co', 'com', 'org', 'net', 'ac', 'gov', 'edu']);

/** Subdomains that only say how the site is reached, not what it is. */
const NOISE_SUBDOMAINS = new Set(['www', 'm']);

/**
 * Capitalizes the first letter of a domain label and turns its hyphens into spaces.
 * @param label - The domain label.
 * @returns For example "My site" for "my-site".
 */
const toWords = (label: string): string => {
  const words = label.replaceAll('-', ' ');

  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * Guesses a readable website title from its URL: the domain's name with its subdomains in front, without `www.` or
 * the domain ending, e.g. "Translate Google" for translate.google.fi. Endings that read like part of the name stay,
 * e.g. "Tetr io" for tetr.io.
 * @param url - The website URL.
 * @returns The title, or an empty string when the URL cannot be parsed.
 */
export const getWebsiteTitleFromUrl = (url: string): string => {
  let hostname: string;

  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }

  if (/^[\d.]+$/.test(hostname) || hostname.startsWith('[')) {
    return hostname;
  }

  const labels = hostname.split('.').filter(Boolean);

  while (labels.length > 1 && NOISE_SUBDOMAINS.has(labels[0])) {
    labels.shift();
  }

  if (labels.length === 1) {
    return toWords(labels[0]);
  }

  const ending = labels.pop()!;
  const keepsEnding = NAME_LIKE_ENDINGS.has(ending);

  if (!keepsEnding && ending.length === 2 && labels.length > 1 && COUNTRY_SECOND_LEVELS.has(labels.at(-1)!)) {
    labels.pop();
  }

  return [...labels.map((label) => toWords(label)), ...(keepsEnding ? [ending] : [])].join(' ');
};
