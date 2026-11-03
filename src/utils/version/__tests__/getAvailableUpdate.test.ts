import type { AppVersion } from '@/interfaces/api/models/AppVersion';

import { describe, expect, it } from 'vitest';

import { getAvailableUpdate } from '../getAvailableUpdate';

const BACKEND_URL = 'https://github.com/NicoHeinola/MovieBrowser3_backend/releases/tag/v1.2.0';
const FRONTEND_URL = 'https://github.com/NicoHeinola/MovieBrowser3_frontend/releases/tag/v1.3.0';

/**
 * Builds an app-version payload.
 * @param backendCurrent - The running backend version.
 * @param backendLatest - The newest backend release.
 * @param frontendLatest - The newest frontend release.
 * @returns The payload, with release links for every known release.
 */
const createAppVersion = (
  backendCurrent: string,
  backendLatest: string | null,
  frontendLatest: string | null,
): AppVersion => ({
  backend: { current: backendCurrent, latest: backendLatest, release_url: backendLatest ? BACKEND_URL : null },
  frontend: { latest: frontendLatest, release_url: frontendLatest ? FRONTEND_URL : null },
  checked_at: '2026-11-03T10:00:00.000000Z',
});

describe('getAvailableUpdate', () => {
  it('finds no update when both halves are current', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', '1.1.0', '1.1.0'), '1.1.0')).toBeNull();
  });

  it('treats unknown releases as no update', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', null, null), '1.1.0')).toBeNull();
  });

  it('ignores a running version that is ahead of the newest release', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', '1.0.0', '1.0.0'), '1.1.0')).toBeNull();
  });

  it('offers a newer backend', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', '1.2.0', '1.1.0'), '1.1.0')).toEqual({
      version: '1.2.0',
      backendReleaseUrl: BACKEND_URL,
      frontendReleaseUrl: null,
    });
  });

  it('offers a newer frontend', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', null, '1.3.0'), '1.1.0')).toEqual({
      version: '1.3.0',
      backendReleaseUrl: null,
      frontendReleaseUrl: FRONTEND_URL,
    });
  });

  it('shows the higher version and both links when both halves are behind', () => {
    expect(getAvailableUpdate(createAppVersion('1.1.0', '1.2.0', '1.3.0'), '1.1.0')).toEqual({
      version: '1.3.0',
      backendReleaseUrl: BACKEND_URL,
      frontendReleaseUrl: FRONTEND_URL,
    });
  });
});
