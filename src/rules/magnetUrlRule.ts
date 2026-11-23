import { i18n } from '@/plugins/i18n';

/** A magnet link with the info hash qBittorrent finds the torrent by: hex, or base32 in older links. */
const magnetPattern = /^magnet:\?.*xt=urn:btih:(?:[a-f0-9]{40}|[a-z2-7]{32})(?:&|$)/i;

export const magnetUrlRule = (value: string): true | string => {
  return magnetPattern.test(value.trim()) || i18n.global.t('rules.invalidMagnetUrl');
};
