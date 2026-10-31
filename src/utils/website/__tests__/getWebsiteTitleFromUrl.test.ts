import { describe, expect, it } from 'vitest';

import { getWebsiteTitleFromUrl } from '../getWebsiteTitleFromUrl';

describe('getWebsiteTitleFromUrl', () => {
  it('names a site after its domain without the ending', () => {
    expect(getWebsiteTitleFromUrl('https://onlinesequencer.net/')).toBe('Onlinesequencer');
    expect(getWebsiteTitleFromUrl('https://www.github.com/nh')).toBe('Github');
  });

  it('puts subdomains in front, ignoring the path and query', () => {
    expect(getWebsiteTitleFromUrl('https://translate.google.fi/?hl=fi&sl=en&tl=fi&op=translate')).toBe(
      'Translate Google',
    );
    expect(getWebsiteTitleFromUrl('https://mail.google.com/mail/u/1/#inbox')).toBe('Mail Google');
  });

  it('keeps endings that read like part of the name', () => {
    expect(getWebsiteTitleFromUrl('https://tetr.io/')).toBe('Tetr io');
    expect(getWebsiteTitleFromUrl('https://character.ai/chat')).toBe('Character ai');
  });

  it('drops two-part country endings', () => {
    expect(getWebsiteTitleFromUrl('https://www.bbc.co.uk/news')).toBe('Bbc');
    expect(getWebsiteTitleFromUrl('https://shop.example.com.au')).toBe('Shop Example');
  });

  it('turns hyphens into spaces and drops mobile subdomains', () => {
    expect(getWebsiteTitleFromUrl('https://m.my-site.org')).toBe('My site');
  });

  it('handles hosts without a domain ending', () => {
    expect(getWebsiteTitleFromUrl('http://localhost:8080/admin')).toBe('Localhost');
    expect(getWebsiteTitleFromUrl('http://192.168.1.10:3000')).toBe('192.168.1.10');
  });

  it('returns an empty string for unparsable URLs', () => {
    expect(getWebsiteTitleFromUrl('not a url')).toBe('');
  });
});
