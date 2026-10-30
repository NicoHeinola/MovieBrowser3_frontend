import { describe, expect, it } from 'vitest';
import { getSyncPlan } from '../getSyncPlan';

describe('getSyncPlan', () => {
  it('splits items into create, update and delete lists', () => {
    const created = { name: 'new' };
    const changed = { id: 1, name: 'changed' };
    const unchanged = { id: 2, name: 'same' };
    const deleted = { id: 3, name: 'deleted' };

    const plan = getSyncPlan<{ id?: number; name: string }, 'id'>(
      [created, changed, unchanged],
      [{ id: 1, name: 'original' }, { id: 2, name: 'same' }, deleted],
      'id',
    );

    expect(plan.toCreate).toEqual([created]);
    expect(plan.toUpdate).toEqual([changed]);
    expect(plan.toDelete).toEqual([deleted]);
  });

  it('treats an item with an id but no original as an update', () => {
    const item = { id: 5, name: 'created in an earlier attempt' };

    const plan = getSyncPlan([item], [], 'id');

    expect(plan.toUpdate).toEqual([item]);
  });
});
