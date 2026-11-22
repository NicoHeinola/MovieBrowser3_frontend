import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { languageFlagCountries } from '../languageFlagCountries';

describe('languageFlagCountries', () => {
  it('maps lowercase language codes to flags that flag-icons ships', () => {
    for (const [language, country] of Object.entries(languageFlagCountries)) {
      expect(language).toBe(language.toLowerCase());
      expect(existsSync(resolve('node_modules/flag-icons/flags/4x3', `${country}.svg`))).toBe(true);
    }
  });
});
