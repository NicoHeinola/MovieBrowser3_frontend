import { describe, expect, it } from 'vitest';

import { getVideoFileProblemsText } from '../getVideoFileProblemsText';

describe('getVideoFileProblemsText', () => {
  it('is null when nothing is wrong', () => {
    expect(getVideoFileProblemsText({ missing_video_files_count: 0, unknown_video_durations_count: 0 })).toBeNull();
  });

  it('names the one problem there is', () => {
    expect(getVideoFileProblemsText({ missing_video_files_count: 1, unknown_video_durations_count: 0 })).toBe(
      '1 video file is missing',
    );
    expect(getVideoFileProblemsText({ missing_video_files_count: 0, unknown_video_durations_count: 3 })).toBe(
      '3 videos have no known length',
    );
  });

  it('names both problems', () => {
    expect(getVideoFileProblemsText({ missing_video_files_count: 2, unknown_video_durations_count: 1 })).toBe(
      '2 video files are missing, 1 video has no known length',
    );
  });
});
