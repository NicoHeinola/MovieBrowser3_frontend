import { filePathRule } from '@/rules/filePathRule';
import { requiredRule } from '@/rules/requiredRule';
import { vlcPathRule } from '@/rules/vlcPathRule';

export const getRules = () => {
  return {
    videoBasePath: [requiredRule, (value: string) => filePathRule(value.trim())],
    vlcMediaPlayerPath: [(value: string) => vlcPathRule(value.trim())],
  };
};
