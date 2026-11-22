import type { AuthTokenResponse } from '@/interfaces/api/responses/AuthTokenResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { authService } from '../authService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

/** The token answer both endpoints give. */
const tokenResponse: AuthTokenResponse = {
  token: 'token-1',
  user: { id: 1, username: 'admin', is_admin: true },
};

describe('authService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('logs in with the credentials', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(tokenResponse));

    await expect(authService.login({ username: 'admin', password: 'secret' })).resolves.toEqual(tokenResponse);

    expect(apiClient.post).toHaveBeenCalledWith('auth/login', { username: 'admin', password: 'secret' });
  });

  it('registers with the credentials', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(tokenResponse));

    await expect(authService.register({ username: 'admin', password: 'secret' })).resolves.toEqual(tokenResponse);

    expect(apiClient.post).toHaveBeenCalledWith('auth/register', { username: 'admin', password: 'secret' });
  });
});
