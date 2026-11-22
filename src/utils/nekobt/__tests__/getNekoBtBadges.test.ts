import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';

import { describe, expect, it } from 'vitest';

import { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';
import { NekoBtVideoCodec } from '@/enums/nekobt/NekoBtVideoCodec';
import { NekoBtVideoSource } from '@/enums/nekobt/NekoBtVideoSource';
import { getNekoBtBadges } from '../getNekoBtBadges';

const createTorrent = (overrides: Partial<NekoBtTorrent> = {}): NekoBtTorrent => ({
  id: '1',
  title: '[Group] Show',
  size_bytes: 1,
  uploaded_at: '2026-01-01T00:00:00.000000Z',
  seeders: 0,
  leechers: 0,
  downloads: 0,
  comments: 0,
  is_batch: false,
  uploader: null,
  groups: [],
  audio_languages: [],
  subtitle_languages: [],
  level: null,
  video_source: null,
  video_codec: null,
  is_original_translation: false,
  is_machine_translation: false,
  is_hardsub: false,
  magnet_url: 'magnet:?xt=urn:btih:1',
  torrent_url: 'https://nekobt.to/1.torrent',
  view_url: 'https://nekobt.to/torrents/1',
  media_url: null,
  ...overrides,
});

describe('getNekoBtBadges', () => {
  it('has no badges for a torrent without details', () => {
    expect(getNekoBtBadges(createTorrent())).toEqual([]);
  });

  it("lists every badge in nekoBT's order, with level colors from the theme", () => {
    const torrent = createTorrent({
      level: NekoBtLevel.FullScaleFansub,
      is_original_translation: true,
      is_machine_translation: true,
      is_hardsub: true,
      is_batch: true,
      video_source: NekoBtVideoSource.BdRemux,
      video_codec: NekoBtVideoCodec.Av1,
    });

    const badges = getNekoBtBadges(torrent);

    expect(badges.map((badge) => badge.key)).toEqual(['level', 'otl', 'mtl', 'hardsub', 'batch', 'source', 'codec']);
    expect(badges[0]).toEqual({
      key: 'level',
      textKey: 'torrents.level.full_scale_fansub',
      color: 'torrent-level-full-scale-fansub',
    });
    expect(badges[5].textKey).toBe('torrents.videoSource.bd_remux');
    expect(badges[1].hintKey).toBe('torrents.originalTranslationHint');
  });
});
