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
  /** A show's only primary title can't be deleted. */
  OnlyPrimaryTitle = 'only_primary_title',
  /** Catch-all for any validation rule without its own code. */
  Invalid = 'invalid',
}
