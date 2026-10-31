import { describe, expect, it } from 'vitest';

import { WebsiteIconKind } from '@/enums/website/WebsiteIconKind';

import { getWebsiteIconKind } from '../getWebsiteIconKind';

describe('getWebsiteIconKind', () => {
  it('falls back to the favicon when no icon is saved', () => {
    expect(getWebsiteIconKind(null)).toBe(WebsiteIconKind.Favicon);
    expect(getWebsiteIconKind(undefined)).toBe(WebsiteIconKind.Favicon);
    expect(getWebsiteIconKind('  ')).toBe(WebsiteIconKind.Favicon);
  });

  it('treats http and https values as images', () => {
    expect(getWebsiteIconKind('https://example.com/logo.png')).toBe(WebsiteIconKind.Image);
    expect(getWebsiteIconKind('HTTP://example.com/logo.png')).toBe(WebsiteIconKind.Image);
  });

  it('treats other values as mdi icons', () => {
    expect(getWebsiteIconKind('mdi-github')).toBe(WebsiteIconKind.Mdi);
  });
});
