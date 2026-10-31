import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import type { EventSourceMessage } from '@microsoft/fetch-event-source';
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';

import { getEnvString } from '@/utils/env/getEnvString';

/** Delay before reconnecting after an error; longer than the library's 1 s default so a stopped backend is not hammered. */
const RETRY_INTERVAL_MS = 5000;

/**
 * Streams the user's watch progress changes from any source, such as the media player advancing to the next episode.
 * The stream reconnects on its own and stays open while the tab is hidden; the caller decides when to close it.
 * Progress changed while disconnected is not replayed.
 * @param options - The subscription options.
 * @param options.token - The bearer token of the user whose progress is streamed.
 * @param options.signal - Aborting it closes the stream for good.
 * @param options.onOpen - Called whenever the stream opens, including every reconnect.
 * @param options.onWatchProgress - Called with each changed watch progress.
 * @returns A promise that resolves once the stream is aborted, or rejects when the backend rejects the token.
 */
const subscribe = async (options: {
  token: string;
  signal: AbortSignal;
  onOpen: () => void;
  onWatchProgress: (watchProgress: ShowWatchProgress) => void;
}): Promise<void> => {
  let isUnauthorized = false;

  await fetchEventSource(`${getEnvString('VITE_API_URL')}/watch-progress/stream`, {
    headers: { Authorization: `Bearer ${options.token}` },
    signal: options.signal,
    /** The library's own hidden-tab handling can leave an untracked second stream open, so callers handle visibility. */
    openWhenHidden: true,
    onopen: async (response: Response): Promise<void> => {
      if (response.status === 401) {
        isUnauthorized = true;
        throw new Error('The watch progress stream rejected the token.');
      }

      if (!response.ok || !response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
        throw new Error(`The watch progress stream failed to open with status ${response.status}.`);
      }

      options.onOpen();
    },
    onmessage: (message: EventSourceMessage): void => {
      if (message.event === 'watch-progress') {
        options.onWatchProgress(JSON.parse(message.data) as ShowWatchProgress);
      }
    },
    onclose: (): void => {
      /** The backend ends streams after a while; throwing hands the close to `onerror`, which reconnects. */
      throw new Error('The watch progress stream was closed by the server.');
    },
    onerror: (error: unknown): number => {
      if (isUnauthorized) {
        throw error;
      }

      return RETRY_INTERVAL_MS;
    },
  });
};

export const watchProgressStreamService = {
  subscribe,
};
