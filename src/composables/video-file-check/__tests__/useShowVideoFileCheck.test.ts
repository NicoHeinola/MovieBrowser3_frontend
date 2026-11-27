import type * as VueQuery from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { videoFileCheckService } from '@/services/video-file/videoFileCheckService';

import { useShowVideoFileCheck } from '../useShowVideoFileCheck';

const invalidateQueries = vi.fn();
const showAPIErrorSnackbar = vi.fn();
const showSuccessSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => ({ invalidateQueries }),
}));

// Only useI18n is replaced: the problems text reaches the real i18n plugin.
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({
    t: (key: string, named?: { problems?: string }) => (named?.problems ? `${key}:${named.problems}` : key),
  }),
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showSuccessSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/video-file/videoFileCheckService', () => ({ videoFileCheckService: { checkShow: vi.fn() } }));

describe('useShowVideoFileCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('checks the show, says every file is fine and refreshes what it changed', async () => {
    vi.mocked(videoFileCheckService.checkShow).mockResolvedValue({
      missing_video_files_count: 0,
      unknown_video_durations_count: 0,
    });
    const { isChecking, checkShow } = useShowVideoFileCheck();

    const check = checkShow(4);
    expect(isChecking.value).toBe(true);
    await check;

    expect(isChecking.value).toBe(false);
    expect(videoFileCheckService.checkShow).toHaveBeenCalledWith(4);
    expect(showSuccessSnackbar).toHaveBeenCalledWith('settings.videoFileCheckFinished');
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it('warns about the problems it found', async () => {
    vi.mocked(videoFileCheckService.checkShow).mockResolvedValue({
      missing_video_files_count: 2,
      unknown_video_durations_count: 1,
    });

    await useShowVideoFileCheck().checkShow(4);

    expect(showWarningSnackbar).toHaveBeenCalledWith(
      'settings.videoFileCheckFinishedProblems:2 video files are missing, 1 video has no known length',
    );
    expect(showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('shows why the show could not be checked', async () => {
    const error = new Error('No drive');
    vi.mocked(videoFileCheckService.checkShow).mockRejectedValue(error);
    const { isChecking, checkShow } = useShowVideoFileCheck();

    await checkShow(4);

    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(isChecking.value).toBe(false);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
