import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';

/** One row of a torrent's file tree: a folder with its rows inside, or a file. */
export interface DownloadFileTreeNode {
  /** A file's index in the torrent, or `folder:<path>` for a folder. */
  id: number | string;
  title: string;
  /** The file's size, or everything inside the folder. */
  sizeBytes: number;
  /** Only on folders. */
  children?: DownloadFileTreeNode[];
}

/**
 * Natural order, so `Episode 2` comes before `Episode 10`.
 * @param a - One name.
 * @param b - The other.
 * @returns The sort order.
 */
const compareNames = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/**
 * Orders a level: folders first, then files, each in natural order, and the same inside every folder.
 * @param nodes - The rows of one level.
 * @returns The ordered rows.
 */
const sortNodes = (nodes: DownloadFileTreeNode[]): DownloadFileTreeNode[] =>
  nodes
    .map((node) => (node.children ? { ...node, children: sortNodes(node.children) } : node))
    .toSorted((a, b) => Number(!a.children) - Number(!b.children) || compareNames(a.title, b.title));

/**
 * Builds a torrent's folders and files into a tree, each folder with its total size.
 * @param files - The torrent's files, paths separated by `/`.
 * @returns The top level of the tree.
 */
export const getDownloadFileTree = (files: DownloadFile[]): DownloadFileTreeNode[] => {
  const root: DownloadFileTreeNode[] = [];
  const folders = new Map<string, DownloadFileTreeNode>();

  for (const file of files) {
    const parts = file.path.split('/');
    let level = root;

    // Walk down the folders, creating each the first time it's seen and adding the file's size to every one
    for (const [depth, name] of parts.slice(0, -1).entries()) {
      const path = parts.slice(0, depth + 1).join('/');
      let folder = folders.get(path);

      if (!folder) {
        folder = { id: `folder:${path}`, title: name, sizeBytes: 0, children: [] };
        folders.set(path, folder);
        level.push(folder);
      }

      folder.sizeBytes += file.size_bytes;
      level = folder.children!;
    }

    level.push({ id: file.index, title: parts.at(-1)!, sizeBytes: file.size_bytes });
  }

  return sortNodes(root);
};
