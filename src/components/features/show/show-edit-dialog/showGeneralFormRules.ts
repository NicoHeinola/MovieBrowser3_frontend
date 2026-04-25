import type { ShowGeneralFormData } from './ShowGeneralFormData';
import { requiredRule } from '@/rules/requiredRule';

export const getRules = (formData: ShowGeneralFormData | null) => {
  return {
    title: [(value: string) => requiredRule(value.trim())],
    titles: (value: string, index: number) => {
      if (!formData?.titles) {
        return true;
      }

      for (let i = 0; i < formData.titles.length; i++) {
        if (i === index) {
          continue;
        }

        if (formData.titles[i].title.trim() === value.trim()) {
          return 'Title must be unique';
        }
      }

      return true;
    },

    description: [],
  };
};
