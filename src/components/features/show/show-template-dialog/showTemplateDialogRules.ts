import { requiredRule } from '@/rules/requiredRule';
import { urlRule } from '@/rules/urlRule';

/**
 * Builds the link form rules. Whether a site can read the link is checked by the backend.
 * @returns The rules per field.
 */
export const getRules = () => {
  return {
    url: [(value: string) => requiredRule((value ?? '').trim()), (value: string) => urlRule((value ?? '').trim())],
  };
};
