import { maxLengthRule } from '@/rules/maxLengthRule';
import { requiredRule } from '@/rules/requiredRule';
import { urlRule } from '@/rules/urlRule';
import { normalizeWebsiteUrl } from '@/utils/website/normalizeWebsiteUrl';

/**
 * Builds the website form rules, mirroring the backend limits.
 * @returns The rules per field.
 */
export const getRules = () => {
  return {
    url: [requiredRule, (value: string) => urlRule(normalizeWebsiteUrl(value)), maxLengthRule(2048)],
    title: [maxLengthRule(255)],
    description: [maxLengthRule(5000)],
    tags: [(value: number[]) => value.length <= 50 || 'Use at most 50 tags'],
    mdiIcon: [requiredRule],
    imageUrl: [requiredRule, urlRule, maxLengthRule(255)],
  };
};
