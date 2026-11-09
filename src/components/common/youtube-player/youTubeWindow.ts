/**
 * The page's window as the YouTube IFrame API script sees it: `YT` once the script has loaded, and the callback the
 * script calls when it is ready. The `YT` types come from `@types/youtube`.
 */
export interface YouTubeWindow extends Window {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
}
