import type { AvailableUpdate } from '@/utils/version/AvailableUpdate';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { AppVersionQueryKey } from '@/enums/query/appVersionQueryKey';
import { appVersionService } from '@/services/version/appVersionService';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { getAvailableUpdate } from '@/utils/version/getAvailableUpdate';

/**
 * Checks once per page load (and after an admin logs in) for a newer MovieBrowser3 release.
 * @returns `update`, the update to show, or `null` when there is none.
 */
export const useUpdateNotice = () => {
  const authStore = useAuthStore();

  // Plain `useQuery` instead of `useAPIQuery`: this is a background check, so a failure (such as an older backend
  // without the endpoint) should stay silent instead of showing an error snackbar.
  const query = useQuery({
    queryKey: [AppVersionQueryKey.UpdateNotice],
    queryFn: appVersionService.get,
    // Admins only: the endpoint answers 401 to guests and 403 to other users.
    enabled: computed<boolean>(() => authStore.isAuthenticated && authStore.isAdmin),
    // Once per page load: a release takes effect on reload anyway, and logout clears the cache for the next admin.
    staleTime: Infinity,
    retry: false,
  });

  /** The update to show, or `null` when there is none or the check has not answered yet. */
  const update = computed<AvailableUpdate | null>(() =>
    query.data.value ? getAvailableUpdate(query.data.value, __APP_VERSION__) : null,
  );

  return {
    update,
  };
};
