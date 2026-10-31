import type { HomepageSection } from './HomepageSection';

export const homepageSections: HomepageSection[] = [
  {
    title: 'Continue Watching',
    subtitle: 'Pick up where you left off with your in-progress shows.',
    icon: 'mdi-play-circle',
    iconColor: 'warning',
    dataKey: 'continueToWatchShows',
    lazyLoad: false,
    playOnClick: true,
    emptyText: 'Nothing in progress yet. Start a show to see it here.',
  },
  {
    title: 'Random',
    subtitle: 'Unexpected picks when you want the catalog to surprise you.',
    icon: 'mdi-shuffle-variant',
    iconColor: 'info',
    dataKey: 'randomShows',
    lazyLoad: true,
  },
];
