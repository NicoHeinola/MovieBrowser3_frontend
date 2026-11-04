import { getVideoFolderSuggestions } from './getVideoFolderSuggestions';

/** A path on a Windows drive as WSL sees it, such as /mnt/g/Videos. */
const WINDOWS_DRIVE_PATH_PATTERN = /^\/mnt\/[a-z](?:\/|$)/;

/**
 * Picks the video folder to start from. VLC runs on Windows, so it can't reliably open the backend's default folder
 * inside WSL or a container: a saved path VLC can't reach is swapped for the first suggestion.
 * @param savedPath - The saved video folder.
 * @param mediaFolders - The media folders, without trailing slashes.
 * @returns The path to prefill.
 */
export const getInitialVideoBasePath = (savedPath: string, mediaFolders: string[]): string => {
  // Compare whole folder names, so /mnt/g/New_Vid2 doesn't count as inside /mnt/g/New_Vid.
  const isInMediaFolder = mediaFolders.some(
    (folder: string) => savedPath === folder || savedPath.startsWith(`${folder}/`),
  );
  // Media folders are the only ones an installed app can see, so a Windows drive only counts without them.
  const isReachableByVlc = mediaFolders.length > 0 ? isInMediaFolder : WINDOWS_DRIVE_PATH_PATTERN.test(savedPath);

  return isReachableByVlc ? savedPath : (getVideoFolderSuggestions(mediaFolders)[0] ?? savedPath);
};
