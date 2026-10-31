import type { EventSourceMessage, FetchEventSourceInit } from '@microsoft/fetch-event-source';
import type * as FetchEventSource from '@microsoft/fetch-event-source';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { watchProgressStreamService } from '../watchProgressStreamService';

vi.mock('@microsoft/fetch-event-source', async (importOriginal) => ({
  ...(await importOriginal<typeof FetchEventSource>()),
  fetchEventSource: vi.fn(),
}));

const progress = { show_id: 12, show_entry_id: 40, episode_id: 913, updated_at: '2026-10-31T20:14:03.000000Z' };

const createMessage = (event: string, data: string): EventSourceMessage => ({ id: '', event, data });

const createResponse = (status: number, contentType: string): Response =>
  new Response(null, { status, headers: { 'content-type': contentType } });

const subscribe = async () => {
  const onOpen = vi.fn();
  const onWatchProgress = vi.fn();
  const controller = new AbortController();

  vi.mocked(fetchEventSource).mockResolvedValue();
  await watchProgressStreamService.subscribe({ token: 'secret', signal: controller.signal, onOpen, onWatchProgress });

  const [url, init] = vi.mocked(fetchEventSource).mock.calls[0] as [string, FetchEventSourceInit];
  return { url, init, controller, onOpen, onWatchProgress };
};

describe('watchProgressStreamService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_URL', 'https://api.test/api/v1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('opens the stream with the bearer token', async () => {
    const { url, init, controller } = await subscribe();

    expect(url).toBe('https://api.test/api/v1/watch-progress/stream');
    expect(init.headers).toEqual({ Authorization: 'Bearer secret' });
    expect(init.signal).toBe(controller.signal);
    expect(init.openWhenHidden).toBe(true);
  });

  it('reports each open of an event stream', async () => {
    const { init, onOpen } = await subscribe();

    await init.onopen?.(createResponse(200, 'text/event-stream; charset=UTF-8'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('passes watch progress events on and ignores others', async () => {
    const { init, onWatchProgress } = await subscribe();

    init.onmessage?.(createMessage('watch-progress', JSON.stringify(progress)));
    init.onmessage?.(createMessage('other', '{}'));

    expect(onWatchProgress).toHaveBeenCalledTimes(1);
    expect(onWatchProgress).toHaveBeenCalledWith(progress);
  });

  it('stops retrying when the token is rejected', async () => {
    const { init, onOpen } = await subscribe();

    const error = await init.onopen?.(createResponse(401, 'application/json')).catch((error_: unknown) => error_);

    expect(onOpen).not.toHaveBeenCalled();
    expect(() => init.onerror?.(error)).toThrow(error as Error);
  });

  it('retries a failed open and a stream closed by the server', async () => {
    const { init, onOpen } = await subscribe();

    const error = await init.onopen?.(createResponse(500, 'application/json')).catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(Error);
    expect(onOpen).not.toHaveBeenCalled();
    expect(init.onerror?.(error)).toBe(5000);
    expect(() => init.onclose?.()).toThrow();
  });
});
