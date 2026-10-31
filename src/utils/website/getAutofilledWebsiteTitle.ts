import { getWebsiteTitleFromUrl } from './getWebsiteTitleFromUrl';

/**
 * Decides what the title field should hold after the URL changes. The title follows a name guessed from the URL while
 * it is empty or still holds the previous autofill, and is left alone once the user has typed their own.
 * @param currentTitle - The title field's value.
 * @param previousAutofill - The title last filled in automatically, or null when none was.
 * @param url - The normalized URL.
 * @returns The title to fill in, or null to keep the current title.
 */
export const getAutofilledWebsiteTitle = (
  currentTitle: string | null | undefined,
  previousAutofill: string | null,
  url: string,
): string | null => {
  const title = (currentTitle ?? '').trim();

  if (!url || (title && title !== previousAutofill)) {
    return null;
  }

  const guessedTitle = getWebsiteTitleFromUrl(url);

  return !guessedTitle || guessedTitle === title ? null : guessedTitle;
};
