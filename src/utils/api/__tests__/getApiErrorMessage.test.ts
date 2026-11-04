import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppLocale } from '@/enums/locale/AppLocale';
import { i18n } from '@/plugins/i18n';
import { getApiErrorMessage } from '../getApiErrorMessage';

/**
 * Builds the error axios throws for a failed response.
 * @param status - The response status.
 * @param data - The response body.
 * @returns The axios error.
 */
const createError = (status: number, data: unknown): AxiosError => {
  return new AxiosError('Request failed', undefined, undefined, undefined, { status, data } as AxiosResponse);
};

describe('getApiErrorMessage', () => {
  beforeEach(() => {
    i18n.global.locale.value = AppLocale.English;
  });

  afterEach(() => {
    i18n.global.locale.value = AppLocale.English;
  });

  it('translates a code into the current language', () => {
    const error = createError(422, { code: 'invalid_credentials', params: {} });

    expect(getApiErrorMessage(error)).toBe('Wrong username or password.');

    i18n.global.locale.value = AppLocale.Finnish;

    expect(getApiErrorMessage(error)).toBe('Väärä käyttäjätunnus tai salasana.');
  });

  it('fills in the params', () => {
    const error = createError(422, { code: 'max', params: { value: '255' } });

    expect(getApiErrorMessage(error)).toContain('255');
  });

  it('keeps raw detail text as it is inside the translated sentence', () => {
    i18n.global.locale.value = AppLocale.Finnish;

    const message = getApiErrorMessage(
      createError(503, { code: 'vlc_start_failed', params: { detail: 'Permission denied | {x} @y' } }),
    );

    expect(message).toBe('VLC:n käynnistys epäonnistui: Permission denied | {x} @y');
  });

  it('reuses the setup messages for the codes they share', () => {
    const error = createError(503, { code: 'vlc_not_found', params: { path: '/usr/bin/vlc' } });

    expect(getApiErrorMessage(error)).toBe('VLC was not found at /usr/bin/vlc.');

    i18n.global.locale.value = AppLocale.Finnish;

    expect(getApiErrorMessage(error)).toBe('VLC:tä ei löytynyt polusta /usr/bin/vlc.');
  });

  it('falls back to the generic error for an unknown code', () => {
    const error = createError(422, { code: 'brand_new_rule', params: {} });

    expect(getApiErrorMessage(error)).toBe(i18n.global.t('apiErrors.generic'));
  });

  it('does not treat object members as codes', () => {
    const error = createError(422, { code: 'constructor', params: {} });

    expect(getApiErrorMessage(error)).toBe(i18n.global.t('apiErrors.generic'));
  });

  it.each([404, 405, 429])('ignores the English message of a %i', (status) => {
    const error = createError(status, { message: 'Not Found' });

    expect(getApiErrorMessage(error)).toBe(i18n.global.t('apiErrors.generic'));
  });

  it('ignores the English message of a 500', () => {
    const error = createError(500, { message: 'Server Error' });

    expect(getApiErrorMessage(error)).toBe(i18n.global.t('apiErrors.server'));
  });

  it('asks to log in again on a 401 without a code', () => {
    expect(getApiErrorMessage(createError(401, 'Unauthorized'))).toBe(i18n.global.t('apiErrors.codes.unauthenticated'));
  });

  it('uses the generic error when the request got no response', () => {
    expect(getApiErrorMessage(new AxiosError('Network Error'))).toBe(i18n.global.t('apiErrors.generic'));
  });

  it('shows the message of a non-API error', () => {
    expect(getApiErrorMessage(new Error('Boom'))).toBe('Boom');
  });

  it('uses the generic error for anything else', () => {
    expect(getApiErrorMessage('nope')).toBe(i18n.global.t('apiErrors.generic'));
  });
});
