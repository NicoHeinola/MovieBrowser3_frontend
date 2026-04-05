export const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;

  const patterns = [/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/];

  return patterns.some((pattern) => pattern.test(url));
};
