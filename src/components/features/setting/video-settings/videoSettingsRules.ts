import { filePathRule } from '@/rules/filePathRule';
import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    videoBasePath: [(value: string) => requiredRule(value.trim()), (value: string) => filePathRule(value.trim())],
    vlcMediaPlayerPath: [(value: string) => requiredRule(value.trim()), (value: string) => filePathRule(value.trim())],
  };
};
