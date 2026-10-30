import { getYouTubeVideoId } from './getYouTubeVideoId';

/**
 * Check whether a URL points to a YouTube video the player can embed.
 *
 * @param url The URL to check.
 * @returns True when a video id can be extracted from the URL.
 */
export const isYouTubeUrl = (url?: string): boolean => getYouTubeVideoId(url) !== null;
