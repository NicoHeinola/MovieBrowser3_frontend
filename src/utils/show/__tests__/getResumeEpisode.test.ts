import { describe, expect, it } from 'vitest';

import { getResumeEpisode } from '../getResumeEpisode';

const createEpisode = (id: number) => ({
  id,
  show_entry_id: Math.floor(id / 10),
  name: '',
  filename: '',
  sequence_number: 0,
});

const entries = [
  { id: 1, episodes: [] },
  { id: 2, episodes: [createEpisode(20), createEpisode(21)] },
  { id: 3, episodes: [createEpisode(30), createEpisode(31)] },
];

const progress = (entryId: number, episodeId: number) => ({
  show_id: 1,
  show_entry_id: entryId,
  episode_id: episodeId,
  updated_at: '2026-10-30',
});

describe('getResumeEpisode', () => {
  it('starts from the first episode of the show when nothing has been watched', () => {
    expect(getResumeEpisode({ entries, watch_progress: null })?.id).toBe(20);
  });

  it('continues from the last started episode', () => {
    expect(getResumeEpisode({ entries, watch_progress: progress(3, 31) })?.id).toBe(31);
  });

  it('continues inside the selected entry only when the progress belongs to it', () => {
    const show = { entries, watch_progress: progress(3, 31) };

    expect(getResumeEpisode(show, entries[2])?.id).toBe(31);
    expect(getResumeEpisode(show, entries[1])?.id).toBe(20);
  });

  it('falls back to the first episode when the saved episode no longer exists', () => {
    expect(getResumeEpisode({ entries, watch_progress: progress(3, 99) })?.id).toBe(20);
  });

  it('returns null when there is nothing to play', () => {
    expect(getResumeEpisode({ entries: [entries[0]!] })).toBeNull();
    expect(getResumeEpisode(null)).toBeNull();
    expect(getResumeEpisode({ entries }, entries[0])).toBeNull();
  });
});
