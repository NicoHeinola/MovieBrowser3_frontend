import type { ShowEntriesFormData } from './ShowEntriesFormData';
import { requiredRule } from '@/rules/requiredRule';

export const getRules = (_formData: ShowEntriesFormData | null) => {
  return {
    name: [(value: string) => requiredRule(value.trim())],
    episodeName: [(value: string) => requiredRule(value.trim())],
  };
};
