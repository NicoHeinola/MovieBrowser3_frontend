/** Folder created for the videos the app stores. */
const VIDEO_FOLDER_NAME = 'MovieBrowser3';

/** Windows' shared Videos folder: every install has it, every user can write to it and VLC can open it. */
const DEFAULT_VIDEO_PARENT_FOLDER = '/mnt/c/Users/Public/Videos';

/**
 * Lists the video folders the wizard offers: one inside each media folder, or Windows' shared Videos folder when there
 * are none.
 * @param mediaFolders - The media folders, without trailing slashes.
 * @returns The suggested folders, best first.
 */
export const getVideoFolderSuggestions = (mediaFolders: string[]): string[] => {
  const parentFolders = mediaFolders.length > 0 ? mediaFolders : [DEFAULT_VIDEO_PARENT_FOLDER];

  return parentFolders.map((folder: string) => `${folder}/${VIDEO_FOLDER_NAME}`);
};
