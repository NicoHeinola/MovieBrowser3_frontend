/** Every file of a download the show's episodes wait for; other files are not downloaded for it. */
export interface UpdateDownloadFilesRequest {
  show_id: number;
  files: { index: number; episode_id: number }[];
}
