/**
 * Builds the url of a YouTube video's thumbnail image. Uses the 16:9 size, because hqdefault is 4:3 with black bars
 * baked in, and maxresdefault doesn't exist for every video.
 * @param videoId - The YouTube video id.
 * @returns The thumbnail url.
 */
export const getYouTubeThumbnailUrl = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
