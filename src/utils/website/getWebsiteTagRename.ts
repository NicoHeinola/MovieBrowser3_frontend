/**
 * Decides whether an edited tag name should be saved.
 * @param currentName - The saved name.
 * @param input - The edited name.
 * @returns The trimmed new name, or null when it is blank or unchanged.
 */
export const getWebsiteTagRename = (currentName: string, input: string | null | undefined): string | null => {
  const name = (input ?? '').trim();

  return name && name !== currentName ? name : null;
};
