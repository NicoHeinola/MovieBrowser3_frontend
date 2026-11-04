import { filePathRule } from '@/rules/filePathRule';

/** Starts VLC from the PATH. The backend can detect this value, so it must pass like a full path does. */
const VLC_ON_PATH = 'vlc';

/**
 * Checks a VLC path: `vlc` on the PATH, a full path or nothing.
 * @param value - The path to check.
 * @returns `true` when it's valid, otherwise the error message.
 */
export const vlcPathRule = (value: string): true | string => value === VLC_ON_PATH || filePathRule(value);
