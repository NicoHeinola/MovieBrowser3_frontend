import { filePathRule } from '@/rules/filePathRule';

export const getRules = () => {
  return {
    videoBasePath: [(value: string) => filePathRule(value.trim())],
    vlcMediaPlayerPath: [(value: string) => filePathRule(value.trim())],
  };
};
