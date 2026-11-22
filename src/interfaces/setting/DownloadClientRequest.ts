/** The qBittorrent connection and download folder as the admin types them, before they are checked and saved. */
export interface DownloadClientRequest {
  /** qBittorrent's Web UI address. Empty turns downloads off. */
  url: string;
  username: string;
  /** Never filled from the saved settings, since the saved password doesn't come back. Empty keeps the saved one. */
  password: string;
  /** The folder qBittorrent downloads into, as the app sees it. */
  downloadPath: string;
}
