export interface StartVideoDurationScanRequest {
  /** Reads only these shows' episodes; left out to read every episode with a file. */
  show_ids?: number[];
  /** Reads only the episodes without a length: never read, unreadable, or left waiting by a scan that stopped. */
  only_missing?: boolean;
}
