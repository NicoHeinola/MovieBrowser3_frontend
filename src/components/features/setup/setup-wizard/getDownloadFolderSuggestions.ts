/** Folder created for the torrents qBittorrent downloads, next to the videos rather than inside them. */
const DOWNLOAD_FOLDER_NAME = 'MovieBrowser3 Downloads';

/** Windows' shared Downloads folder: every install has it and every user can write to it. */
const DEFAULT_DOWNLOAD_PARENT_FOLDER = '/mnt/c/Users/Public/Downloads';

/**
 * Lists the download folders the wizard offers: one inside each media folder, or Windows' shared Downloads folder when
 * there are none.
 * @param mediaFolders - The media folders, without trailing slashes.
 * @returns The suggested folders, best first.
 */
export const getDownloadFolderSuggestions = (mediaFolders: string[]): string[] => {
  const parentFolders = mediaFolders.length > 0 ? mediaFolders : [DEFAULT_DOWNLOAD_PARENT_FOLDER];

  return parentFolders.map((folder: string) => `${folder}/${DOWNLOAD_FOLDER_NAME}`);
};
