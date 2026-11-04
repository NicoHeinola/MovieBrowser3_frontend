import { describe, expect, it } from 'vitest';

import { SetupCheckCode } from '@/enums/setup/SetupCheckCode';

import enMessages from '../en.json';
import fiMessages from '../fi.json';

/**
 * Lists the dotted path of every message in a locale file.
 * @param messages - The locale file's contents.
 * @param prefix - The path of the parent object.
 * @returns The sorted message keys.
 */
const getKeys = (messages: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(messages)
    .flatMap(([key, value]) =>
      typeof value === 'object' && value !== null
        ? getKeys(value as Record<string, unknown>, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    )
    .toSorted();
};

describe('i18n messages', () => {
  it('has the same keys in every language', () => {
    expect(getKeys(fiMessages)).toEqual(getKeys(enMessages));
  });

  it('has a message for every setup check code', () => {
    expect(Object.keys(enMessages.setup.checkCodes).toSorted()).toEqual(Object.values(SetupCheckCode).toSorted());
  });

  it('has no empty messages', () => {
    for (const messages of [enMessages, fiMessages]) {
      const values = JSON.stringify(messages).match(/"[^"]*":\s*""/g);
      expect(values).toBeNull();
    }
  });
});
