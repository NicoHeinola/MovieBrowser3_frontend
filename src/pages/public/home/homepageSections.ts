import type { HomepageSection } from './HomepageSection';

export const homepageSections: HomepageSection[] = [
  {
    title: 'Continue Watching',
    subtitle: 'Pick up where you left off with your in-progress shows.',
    icon: 'mdi-play-circle',
    iconColor: 'warning',
    dataKey: 'continueToWatchShows',
    lazyLoad: false,
  },
  {
    title: 'Isekai',
    subtitle: 'World-hopping stories with larger-than-life stakes.',
    icon: 'mdi-earth',
    iconColor: 'success',
    dataKey: 'isekaiShows',
    lazyLoad: false,
  },
  {
    title: 'Romance',
    subtitle: 'Softer pacing, sharper emotions, and character chemistry.',
    icon: 'mdi-heart',
    iconColor: 'error',
    dataKey: 'romanceShows',
    lazyLoad: true,
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
