import { ShowLinkType } from '@/enums/show/ShowLinkType';

/** The MDI icon of each show link type. */
export const SHOW_LINK_TYPE_ICONS: Record<ShowLinkType, string> = {
  [ShowLinkType.Sequel]: 'mdi-skip-next-circle',
  [ShowLinkType.Prequel]: 'mdi-skip-previous-circle',
  [ShowLinkType.TvSpecial]: 'mdi-television-classic',
  [ShowLinkType.SuggestedNext]: 'mdi-arrow-right-circle',
  [ShowLinkType.SuggestedPrevious]: 'mdi-arrow-left-circle',
  [ShowLinkType.SpinOff]: 'mdi-source-branch',
};
