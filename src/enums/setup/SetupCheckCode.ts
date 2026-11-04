/** Why a setup path failed its check. Messages live under `setup.checkCodes` in i18n. */
export enum SetupCheckCode {
  /** No video folder was entered. */
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
  /** The VLC bridge didn't answer. Params: `url`. */
  VlcBridgeUnreachable = 'vlc_bridge_unreachable',
  /** The VLC bridge is too old to check VLC. */
  VlcBridgeOutdated = 'vlc_bridge_outdated',
  /** The VLC bridge refused the request. Params: `status`. */
  VlcBridgeUnauthorized = 'vlc_bridge_unauthorized',
  /** The VLC bridge rejected the path without saying why. */
  VlcBridgeRejected = 'vlc_bridge_rejected',
}
