/**
 * How long until a query polls again, for `refetchInterval`: only while what it reads is moving. A failed read stops
 * the polling, as each failure shows a snackbar; a window refocus or a refetch starts it again.
 * @param state - The query's state.
 * @param state.data - The last data it read.
 * @param state.status - The query's status; a failed refetch keeps the old data, so the data alone can't tell.
 * @param isMoving - Whether the data changes by itself right now.
 * @param intervalMs - The time between polls.
 * @returns The time, or false to stop.
 */
export const getPollInterval = <TData>(
  state: { data?: TData; status: string },
  isMoving: (data: TData) => boolean,
  intervalMs: number,
): number | false => {
  return state.data !== undefined && state.status !== 'error' && isMoving(state.data) ? intervalMs : false;
};
