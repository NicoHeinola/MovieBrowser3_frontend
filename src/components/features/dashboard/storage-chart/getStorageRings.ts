import type { StorageRings } from './StorageRings';
import type { StorageSlice } from './StorageSlice';
import type { Show } from '@/interfaces/api/models/Show';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { getShowVideoBytes } from '@/utils/show/video-file/getShowVideoBytes';

/**
 * Splits the disk and the video files into the arcs of the storage chart.
 * @param stats - The dashboard stats with the video and disk sizes.
 * @param shows - The biggest shows, already ranked by the backend, with their entries and episodes loaded.
 * @returns The disk ring (null when the disk is unknown) and the show ring.
 */
export const getStorageRings = (stats: DashboardStatsResponse, shows: Show[]): StorageRings => {
  const videoBytes = stats.video_files_total_bytes;

  // One arc per show, in the backend's order; shows without measured files would only add empty arcs.
  const showSlices: StorageSlice[] = shows
    .map((show): StorageSlice => ({ kind: 'show', bytes: getShowVideoBytes(show), show }))
    .filter((slice) => slice.bytes > 0);

  // The rest comes from the backend's total, not from summing the list: the list stops at 1000 shows.
  const listedShowBytes = showSlices.reduce((sum, slice) => sum + slice.bytes, 0);
  const otherShowBytes = Math.max(0, videoBytes - listedShowBytes);

  if (otherShowBytes > 0) {
    showSlices.push({ kind: 'otherShows', bytes: otherShowBytes });
  }

  if (stats.disk_total_bytes === null || stats.disk_free_bytes === null) {
    return { disk: null, shows: showSlices };
  }

  // Video sizes are stored at upload or scan time, so a file deleted or replaced since then can push the video
  // total past what the disk reports as used. Clamp so "other files" never goes negative.
  const freeBytes = Math.min(stats.disk_free_bytes, stats.disk_total_bytes);
  const otherFileBytes = Math.max(0, stats.disk_total_bytes - freeBytes - videoBytes);

  // The invisible gap fills the show ring past the videos, so each show sits under the video arc.
  const showBytes = showSlices.reduce((sum, slice) => sum + slice.bytes, 0);
  showSlices.push({ kind: 'gap', bytes: Math.max(0, stats.disk_total_bytes - showBytes) });

  return {
    disk: [
      { kind: 'videos', bytes: videoBytes },
      { kind: 'otherFiles', bytes: otherFileBytes },
      { kind: 'free', bytes: freeBytes },
    ],
    shows: showSlices,
  };
};
