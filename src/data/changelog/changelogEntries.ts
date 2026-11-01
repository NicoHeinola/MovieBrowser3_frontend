import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/**
 * Every released update, newest first. Add a new entry at the top on release: users who have not seen
 * its version get the "What's new" popup on their next visit.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.0.1',
    date: '2026-11-01',
    changes: [
      { type: ChangelogChangeType.Fixed, text: 'The filter drawer now darkens the whole page on pages with tabs.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-11-01',
    changes: [
      {
        type: ChangelogChangeType.Added,
        text: 'Home page with the latest shows on a banner that plays trailers or shows backgrounds.',
      },
      { type: ChangelogChangeType.Added, text: 'Category rows on the home page, chosen by admins.' },
      {
        type: ChangelogChangeType.Added,
        text: 'Show search with sorting and filters for categories, watch status and previews.',
      },
      { type: ChangelogChangeType.Added, text: 'Search, filters and sorting are kept in the page URL.' },
      { type: ChangelogChangeType.Added, text: 'Quick show search in the top navigation, focused with Ctrl+K.' },
      {
        type: ChangelogChangeType.Added,
        text: 'Show cards play a preview on hover and show your watch status and the full title.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Show drawer with the trailer, seasons, episodes and related shows in collapsible sections.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Start or continue watching a show, season or episode, with your progress saved as you watch.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Watch statuses (watching, plan to watch, completed, on hold, dropped) for seasons or whole shows.',
      },
      { type: ChangelogChangeType.Added, text: 'Profile page for changing your username and password.' },
      { type: ChangelogChangeType.Added, text: 'Changelog page and a "What\'s new" popup after each update.' },
      {
        type: ChangelogChangeType.Added,
        text: 'Admin dashboard with stats, favorite websites and recently added shows.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Admin show editing: details, seasons and movies, episodes from files, categories and related shows.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Admin category management, including which categories appear on the home page.',
      },
      { type: ChangelogChangeType.Added, text: 'Admin website management with tags and favorites.' },
      { type: ChangelogChangeType.Added, text: 'Admin user management with search and filters.' },
      {
        type: ChangelogChangeType.Added,
        text: 'Admin settings for home banner videos and backgrounds, and video playback paths.',
      },
    ],
  },
];
