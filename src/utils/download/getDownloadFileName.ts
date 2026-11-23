/**
 * The file name in a torrent file's path, without its folders.
 * @param path - The path inside the torrent, folders separated by `/`.
 * @returns The file name, e.g. `Show - 01.mkv` for `Batch/Show - 01.mkv`.
 */
export const getDownloadFileName = (path: string): string => {
  return path.slice(path.lastIndexOf('/') + 1);
};
