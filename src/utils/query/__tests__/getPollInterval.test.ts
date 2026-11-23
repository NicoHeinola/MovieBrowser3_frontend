import { describe, expect, it, vi } from 'vitest';

import { getPollInterval } from '../getPollInterval';

const isMoving = (data: string): boolean => data === 'moving';

describe('getPollInterval', () => {
  it('polls only while the data moves', () => {
    expect(getPollInterval({ data: 'moving', status: 'success' }, isMoving, 1000)).toBe(1000);
    expect(getPollInterval({ data: 'done', status: 'success' }, isMoving, 1000)).toBe(false);
  });

  it('stops after a failed read, though the old data still says it moves', () => {
    expect(getPollInterval({ data: 'moving', status: 'error' }, isMoving, 1000)).toBe(false);
  });

  it('does not poll before the first read', () => {
    const isAnyMoving = vi.fn(() => true);

    expect(getPollInterval({ status: 'pending' }, isAnyMoving, 1000)).toBe(false);
    expect(isAnyMoving).not.toHaveBeenCalled();
  });
});
