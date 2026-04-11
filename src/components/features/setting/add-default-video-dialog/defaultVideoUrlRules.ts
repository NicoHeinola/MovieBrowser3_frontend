import type { StringRule } from '@/rules/stringRule';

import { requiredRule } from '@/rules/requiredRule';
import { isYouTubeUrl } from '@/utils/youtube/isYouTubeUrl';

export const defaultVideoUrlRules: StringRule[] = [
  (value: string) => requiredRule(value.trim()),
  (value: string) => isYouTubeUrl(value.trim()) || 'Enter a valid YouTube URL',
];
