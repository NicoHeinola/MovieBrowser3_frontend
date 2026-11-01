import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/**
 * Every released update, newest first. Add a new entry at the top on release: users who have not seen
 * its version get the "What's new" popup on their next visit.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.2.2',
    date: '2026-11-01',
    changes: [
      {
        type: ChangelogChangeType.Changed,
        text: 'Buttons are calmer: only the main action on a screen is yellow.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Episodes match their progress color: watched ones are green and the one you last watched is blue.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Filters you turn on are now blue, so they are easy to tell apart from buttons.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The show drawer opens on the season you last watched, with its episodes ready.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The watch status button names what it changes, such as "Season" or "Whole show".',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Hover a shortened season name in the show drawer to read it in full.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The watch buttons and the show search results button are now translated to Finnish.',
      },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-11-01',
    changes: [
      {
        type: ChangelogChangeType.Changed,
        text: 'The red accent color is now a calm blue, so highlights no longer look like errors.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'In the show drawer, the season you last watched has a play marker instead of a red outline.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The episode you last watched stays marked in the episode list, even when its season is completed.',
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-11-01',
    changes: [
      {
        type: ChangelogChangeType.Changed,
        text: 'Your username and the language picker moved into the account menu, keeping the top bar tidier.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-11-01',
    changes: [
      { type: ChangelogChangeType.Added, text: 'The app is now available in English and Finnish.' },
      {
        type: ChangelogChangeType.Added,
        text: 'A language button switches the language, and first-time visitors are asked which one to use.',
      },
    ],
  },
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
