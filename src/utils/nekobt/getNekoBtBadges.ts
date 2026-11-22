import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { NekoBtBadge } from '@/interfaces/nekobt/NekoBtBadge';

import { NEKOBT_BADGE_STYLES } from '@/data/nekobt/nekoBtBadgeStyles';

/**
 * The badges of a nekoBT torrent, in the order nekoBT shows them: level, translation and subtitle tags, batch, then
 * video source and codec.
 * @param torrent - The torrent.
 * @returns The badges it has.
 */
export const getNekoBtBadges = (torrent: NekoBtTorrent): NekoBtBadge[] => {
  const { levelColors, tags, videoSourceColor, videoCodecColor } = NEKOBT_BADGE_STYLES;
  const badges: NekoBtBadge[] = [];

  if (torrent.level) {
    badges.push({ key: 'level', textKey: `torrents.level.${torrent.level}`, color: levelColors[torrent.level] });
  }

  // The tags it has, each with its fixed look
  const tagFlags: Record<keyof typeof tags, boolean> = {
    originalTranslation: torrent.is_original_translation,
    machineTranslation: torrent.is_machine_translation,
    hardsub: torrent.is_hardsub,
    batch: torrent.is_batch,
  };

  for (const [tag, style] of Object.entries(tags) as [keyof typeof tags, NekoBtBadge][]) {
    if (tagFlags[tag]) {
      badges.push(style);
    }
  }

  if (torrent.video_source) {
    badges.push({ key: 'source', textKey: `torrents.videoSource.${torrent.video_source}`, color: videoSourceColor });
  }

  if (torrent.video_codec) {
    badges.push({ key: 'codec', textKey: `torrents.videoCodec.${torrent.video_codec}`, color: videoCodecColor });
  }

  return badges;
};
