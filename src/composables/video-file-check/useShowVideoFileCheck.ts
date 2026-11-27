import { ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useVideoFileCheckReport } from '@/composables/video-file-check/useVideoFileCheckReport';
import { videoFileCheckService } from '@/services/video-file/videoFileCheckService';

/**
 * Checks one show's video files while the user waits.
 * @returns Whether a check is in progress, and the start action.
 */
export const useShowVideoFileCheck = () => {
  const isChecking = ref<boolean>(false);

  const { reportFinished, refreshCheckedData } = useVideoFileCheckReport();
  const { showAPIErrorSnackbar } = useCommonSnackbar();

  /**
   * Checks a show's video files and says what was found.
   * @param showId - The show.
   * @returns Nothing.
   */
  const checkShow = async (showId: number): Promise<void> => {
    isChecking.value = true;

    try {
      const problems = await videoFileCheckService.checkShow(showId);

      reportFinished(problems);
      await refreshCheckedData();
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isChecking.value = false;
    }
  };

  return { isChecking, checkShow };
};
