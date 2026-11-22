import type { ShowEntriesFormData } from './ShowEntriesFormData';
import { requiredRule } from '@/rules/requiredRule';
import { urlRule } from '@/rules/urlRule';

export const getRules = (_formData: ShowEntriesFormData | null) => {
  return {
    name: [(value: string) => requiredRule(value.trim())],
    type: [(value: string) => requiredRule(value.trim())],
    // Optional: only a filled-in link has to be one
    url: [(value: string | null) => !(value ?? '').trim() || urlRule((value ?? '').trim())],
    episodeName: [(value: string) => requiredRule(value.trim())],
    episodeFile: [],
  };
};
