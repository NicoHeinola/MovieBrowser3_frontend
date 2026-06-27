import { filePathRule } from '@/rules/filePathRule';
import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    videoBasePath: [requiredRule, (value: string) => filePathRule(value.trim())],
    vlcMediaPlayerPath: [(value: string) => filePathRule(value.trim())],
  };
};
