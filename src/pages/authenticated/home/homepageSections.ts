import type { HomepageSection } from './HomepageSection';

/** Fixed home page rows. `title`, `subtitle` and `emptyText` hold i18n keys; HomeView translates them. */
export const homepageSections: HomepageSection[] = [
  {
    title: 'home.continueWatchingTitle',
    subtitle: 'home.continueWatchingSubtitle',
    icon: 'mdi-play-circle',
    iconColor: 'warning',
    dataKey: 'continueToWatchShows',
    lazyLoad: false,
    playOnClick: true,
    emptyText: 'home.continueWatchingEmpty',
  },
  {
    title: 'home.randomTitle',
    subtitle: 'home.randomSubtitle',
    icon: 'mdi-shuffle-variant',
    iconColor: 'info',
    dataKey: 'randomShows',
    lazyLoad: true,
  },
];
