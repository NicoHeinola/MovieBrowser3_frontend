/** Why the API turned a request down. Messages live under `apiErrors.codes` in i18n. */
export enum ApiErrorCode {
  /** The request has no valid login. */
  Unauthenticated = 'unauthenticated',
  /** The user may not do this. */
  Forbidden = 'forbidden',

  /** VLC closed before the playlist was built. */
  VlcClosedEarly = 'vlc_closed_early',
  /** VLC did not start in time. */
  VlcStartTimeout = 'vlc_start_timeout',
  /** No free port for VLC's web interface. */
  VlcNoFreePort = 'vlc_no_free_port',
  /** VLC could not be started. Params: `detail`, raw OS output in English. */
  VlcStartFailed = 'vlc_start_failed',
  /** A path could not be converted for VLC. Params: `path`, `detail`. */
  VlcPathConversionFailed = 'vlc_path_conversion_failed',
  /** Nothing exists at the VLC path. Params: `path`. */
  VlcNotFound = 'vlc_not_found',
  /** The file at the VLC path isn't VLC. Params: `path`. */
  VlcWrongBinary = 'vlc_wrong_binary',
  /** The VLC bridge didn't answer. Params: `url`. */
  VlcBridgeUnreachable = 'vlc_bridge_unreachable',
  /** The VLC bridge is too old. */
  VlcBridgeOutdated = 'vlc_bridge_outdated',
  /** The VLC bridge refused the request. Params: `status`. */
  VlcBridgeUnauthorized = 'vlc_bridge_unauthorized',
  /** The VLC bridge rejected the request without saying why. */
  VlcBridgeRejected = 'vlc_bridge_rejected',

  /** A checkbox-style value must be accepted. */
  Accepted = 'accepted',
  /** The value must be a list. */
  Array = 'array',
  /** The value must be true or false. */
  Boolean = 'boolean',
  /** The confirmation value doesn't match. */
  Confirmed = 'confirmed',
  /** The value must be a date. */
  Date = 'date',
  /** The list has duplicates. */
  Distinct = 'distinct',
  /** The value isn't one of the allowed options. */
  Enum = 'enum',
  /** The referenced record doesn't exist. */
  Exists = 'exists',
  /** The value must be a file. */
  File = 'file',
  /** The value isn't one of the allowed options. */
  In = 'in',
  /** The value must be a whole number. */
  Integer = 'integer',
  /** The value is not allowed. */
  NotIn = 'not_in',
  /** The value must be a number. */
  Numeric = 'numeric',
  /** A required value is missing. */
  Required = 'required',
  /** The value must be text. */
  String = 'string',
  /** The value is already in use. */
  Unique = 'unique',
  /** The value must be a URL. */
  Url = 'url',
  /** Text length, list size or number is over the limit. Params: `value`. */
  Max = 'max',
  /** Text length, list size or number is under the limit. Params: `value`. */
  Min = 'min',
  /** The path must be absolute. */
  AbsolutePath = 'absolute_path',
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
  /** The value is already in use, ignoring case. */
  UniqueIgnoringCase = 'unique_ignoring_case',
  /** Login failed: wrong username or password. */
  InvalidCredentials = 'invalid_credentials',
  /** The episode has no video file. */
  NoVideoFile = 'no_video_file',
  /** The video folder can't be reached or is empty, so video files can't be checked. */
  VideoBasePathUnavailable = 'video_base_path_unavailable',
  /** A video file check is already running, so a new one wasn't started. */
  VideoFileCheckRunning = 'video_file_check_running',
  /** The last video file check crashed, so its results may be partial. */
  VideoFileCheckFailed = 'video_file_check_failed',
  /** An episode length scan is reading the video files, so they can't be moved now. */
  VideoDurationScanRunning = 'video_duration_scan_running',
  /** The last episode length scan stopped on an error. */
  VideoDurationScanFailed = 'video_duration_scan_failed',
  /** The video folder can only change through a relocation, which moves the videos with it. */
  VideoBasePathNeedsRelocation = 'video_base_path_needs_relocation',
  /** The video folder is being moved, so this change has to wait for the move to end. */
  VideoRelocationRunning = 'video_relocation_running',
  /** Moving the video folder failed and the files were moved back. */
  VideoRelocationFailed = 'video_relocation_failed',
  /** Moving the video folder failed and moving the files back failed too, so some may be in the new folder. */
  VideoRelocationRevertFailed = 'video_relocation_revert_failed',
  /** A torrent site didn't answer the search, or answered with an error; `site` tells which, such as `nekobt`. */
  TorrentSiteUnavailable = 'torrent_site_unavailable',
  /** A show template link points at no show on its site, such as a mistyped id. */
  ShowTemplateNotFound = 'show_template_not_found',
  /** A show template link's site didn't answer, or answered with an error. */
  ShowTemplateUnavailable = 'show_template_unavailable',
  /** MyAnimeList didn't answer the anime search, or answered with an error. */
  MalUnavailable = 'mal_unavailable',
  /** A show template link is to a page no source can read; it must be a nekoBT media page or a MyAnimeList anime page. */
  UnsupportedShowTemplateUrl = 'unsupported_show_template_url',
  /** The backup folder doesn't exist or can't be written to, such as an external drive that isn't mounted. */
  BackupDirUnavailable = 'backup_dir_unavailable',
  /** The database dump failed. */
  BackupFailed = 'backup_failed',
  /** A show's only primary title can't be deleted. */
  OnlyPrimaryTitle = 'only_primary_title',
  /** The only admin can't lose admin rights. */
  LastAdmin = 'last_admin',
  /** Catch-all for any validation rule without its own code. */
  Invalid = 'invalid',
}
