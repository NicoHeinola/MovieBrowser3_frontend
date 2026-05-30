import { ShowLinkType } from '@/enums/show/ShowLinkType';

const showLinkTypeIcons: Record<ShowLinkType, string> = {
  [ShowLinkType.Sequel]: 'mdi-skip-next-circle',
  [ShowLinkType.Prequel]: 'mdi-skip-previous-circle',
  [ShowLinkType.TvSpecial]: 'mdi-television-classic',
  [ShowLinkType.SuggestedNext]: 'mdi-arrow-right-circle',
  [ShowLinkType.SuggestedPrevious]: 'mdi-arrow-left-circle',
  [ShowLinkType.SpinOff]: 'mdi-source-branch',
};

export const getShowLinkTypeIcon = (showLinkType: ShowLinkType): string => {
  return showLinkTypeIcons[showLinkType];
};