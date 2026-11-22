import type { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';
import type { NekoBtVideoCodec } from '@/enums/nekobt/NekoBtVideoCodec';
import type { NekoBtVideoSource } from '@/enums/nekobt/NekoBtVideoSource';

/** One torrent of a nekoBT search. Its links point at nekoBT, except the magnet, which works anywhere. */
export interface NekoBtTorrent {
  /** nekoBT's id. */
  id: string;
  title: string;
  size_bytes: number;
  uploaded_at: string;
  seeders: number;
  leechers: number;
  /** How many times the torrent was downloaded to the end. */
  downloads: number;
  comments: number;
  /** Whether the torrent holds a whole season or series instead of single episodes. */
  is_batch: boolean;
  /** Who uploaded it, or null when anonymous. */
  uploader: string | null;
  /** Release groups that made it. */
  groups: string[];
  /** Language codes as nekoBT writes them, such as `ja` or `es-419`. */
  audio_languages: string[];
  /** Language codes as nekoBT writes them. */
  subtitle_languages: string[];
  level: NekoBtLevel | null;
  video_source: NekoBtVideoSource | null;
  video_codec: NekoBtVideoCodec | null;
  /** Translated by the group itself instead of reusing an official translation. */
  is_original_translation: boolean;
  is_machine_translation: boolean;
  /** The subtitles are burned into the video. */
  is_hardsub: boolean;
  magnet_url: string;
  torrent_url: string;
  /** The torrent's page on nekoBT. */
  view_url: string;
  /** nekoBT's page of the show or movie the torrent belongs to, when it knows one. */
  media_url: string | null;
}
