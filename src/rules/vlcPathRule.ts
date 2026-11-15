import { i18n } from '@/plugins/i18n';
import { filePathRule } from '@/rules/filePathRule';

/** Starts VLC from the PATH. The backend can detect this value, so it must pass like a full path does. */
const VLC_ON_PATH = 'vlc';

/** The only file names the backend starts as VLC. Compared ignoring case, so the backend has the final say. */
const VLC_FILE_NAMES = new Set<string>(['vlc', 'vlc.exe']);

/**
 * Checks a VLC path: `vlc` on the PATH, a full path to `vlc` or `vlc.exe`, or nothing.
 * @param value - The path to check.
 * @returns `true` when it's valid, otherwise the error message.
 */
export const vlcPathRule = (value: string): true | string => {
  if (!value || value === VLC_ON_PATH) {
    return true;
  }

  const pathResult = filePathRule(value);

  if (pathResult !== true) {
    return pathResult;
  }

  // The file name is what follows the last slash; a trailing slash leaves none, so it fails too.
  const fileName = value.slice(value.lastIndexOf('/') + 1).toLowerCase();

  return VLC_FILE_NAMES.has(fileName) || i18n.global.t('rules.vlcWrongBinary');
};
