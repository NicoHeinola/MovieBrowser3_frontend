/** Why a setup value failed its check. Messages live under `setup.checkCodes` in i18n. */
export enum SetupCheckCode {
  /** No video base folder was entered. */
  PathRequired = 'path_required',
  /** The path doesn't start with `/`, such as a Windows path. */
  PathNotAbsolute = 'path_not_absolute',
  /** The path contains `..`. */
  PathHasParentSegment = 'path_has_parent_segment',
  /** The folder is outside every media folder. Params: `folders`. */
  PathOutsideMediaFolders = 'path_outside_media_folders',
  /** The path is a file, not a folder. */
  PathIsFile = 'path_is_file',
  /** The folder exists but can't be written to. */
  PathNotWritable = 'path_not_writable',
  /** The folder doesn't exist and can't be created. Params: `parent`. */
  PathNotCreatable = 'path_not_creatable',
  /** Nothing exists at the VLC path. Params: `path`. */
  VlcNotFound = 'vlc_not_found',
  /** The file at the VLC path isn't VLC. Params: `path`. */
  VlcWrongBinary = 'vlc_wrong_binary',
  /** The host bridge didn't answer. Params: `url`. */
  HostBridgeUnreachable = 'host_bridge_unreachable',
  /** The host bridge is too old to check VLC. */
  HostBridgeOutdated = 'host_bridge_outdated',
  /** The host bridge refused the request. Params: `status`. */
  HostBridgeUnauthorized = 'host_bridge_unauthorized',
  /** The host bridge rejected the path without saying why. */
  HostBridgeRejected = 'host_bridge_rejected',
  /** No qBittorrent address was entered. */
  UrlRequired = 'url_required',
  /** qBittorrent didn't answer at the address. */
  QBittorrentUnreachable = 'qbittorrent_unreachable',
  /** qBittorrent turned the username or password down. */
  QBittorrentLoginFailed = 'qbittorrent_login_failed',
  /** qBittorrent banned the app's address after too many failed logins. */
  QBittorrentBanned = 'qbittorrent_banned',
  /** qBittorrent is older than the app supports. Params: `version`, `minimum_version`. */
  QBittorrentOutdated = 'qbittorrent_outdated',
}
