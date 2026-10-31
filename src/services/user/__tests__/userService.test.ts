import type { User } from '@/interfaces/api/models/User';
import type { CreateUserRequest } from '@/interfaces/api/requests/CreateUserRequest';
import type { UpdateUserRequest } from '@/interfaces/api/requests/UpdateUserRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/plugins/api/apiClient';

import { userService } from '../userService';

vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

const user: User = {
  id: 3,
  username: 'viewer',
  is_admin: false,
};

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists and gets users', async () => {
    const page: PaginatedResponse<User> = {
      data: [user],
      meta: { current_page: 1, last_page: 1, per_page: 25, total: 1 },
    };
    const query = { sort: 'username', filter: { username: 'view' }, page: { number: 1, size: 25 } };

    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(page)).mockResolvedValueOnce(createResponse(user));

    await expect(userService.list(query)).resolves.toEqual(page);
    await expect(userService.get(3)).resolves.toEqual(user);

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'users', { params: query });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'users/3');
  });

  it('creates and updates users', async () => {
    const createRequest: CreateUserRequest = {
      username: 'viewer',
      password: 'secret',
      password_confirmation: 'secret',
      is_admin: false,
    };
    const updateRequest: UpdateUserRequest = {
      is_admin: true,
    };

    vi.mocked(apiClient.post).mockResolvedValue(createResponse(user));
    vi.mocked(apiClient.patch).mockResolvedValue(createResponse({ ...user, is_admin: true }));

    await expect(userService.create(createRequest)).resolves.toEqual(user);
    await expect(userService.update(3, updateRequest)).resolves.toEqual({ ...user, is_admin: true });

    expect(apiClient.post).toHaveBeenCalledWith('users', createRequest);
    expect(apiClient.patch).toHaveBeenCalledWith('users/3', updateRequest);
  });

  it('removes users', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(createResponse(undefined));

    await expect(userService.remove(3)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('users/3');
  });
});
