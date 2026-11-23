/** Every file of a download picked for an episode; files left out are not downloaded. */
export interface UpdateDownloadFilesRequest {
  show_id: number;
  files: { index: number; episode_id: number }[];
}
