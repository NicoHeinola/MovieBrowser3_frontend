import { describe, expect, it, vi } from 'vitest';

import { useUserRoleOptions } from '../useUserRoleOptions';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe('useUserRoleOptions', () => {
  it('offers the admin chip', () => {
    const { options } = useUserRoleOptions();

    expect(options.value).toEqual([{ value: 'admin', text: 'user.admin', icon: 'mdi-shield-crown' }]);
  });
});
