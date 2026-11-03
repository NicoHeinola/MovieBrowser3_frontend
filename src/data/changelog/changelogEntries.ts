import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/**
 * Every version, newest first. The top entry may be the next, unreleased version (`date: null`): its lines collect
 * there until the release dates it. Users who have not seen a released version get the "What's new" popup on their
 * next visit.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.1.1',
    date: null,
    changes: [],
  },
  {
    version: '1.1.0',
    date: '2026-11-03',
    changes: [
      {
        type: ChangelogChangeType.Added,
        text: 'Episodes continue where you stopped in VLC. The arrow on the resume button plays from the start.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'The episode you are watching shows how far in you are, and updates live while VLC plays.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Admins see an "Update available" button when a new version is out, with the update command and links.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The "What\'s new" popup no longer appears the first time you sign in.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Show search finds titles regardless of upper and lower case.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The version in the top left shows the version you are running.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-11-03',
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
        text: 'The show drawer opens on the season you last watched, marked with a play icon, with its episodes ready.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Episodes match their progress color: watched ones are green and the one you last watched is blue.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Start or continue watching a show, season or episode, with your progress saved as you watch.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Watch statuses (watching, plan to watch, completed, on hold, dropped) for seasons or whole shows.',
      },
      { type: ChangelogChangeType.Added, text: 'The app is available in English and Finnish.' },
      {
        type: ChangelogChangeType.Added,
        text: 'First-time visitors are asked which language to use, and the account menu switches it later.',
      },
      { type: ChangelogChangeType.Added, text: 'Profile page for changing your username and password.' },
      { type: ChangelogChangeType.Added, text: 'Changelog page and a "What\'s new" popup after each update.' },
      {
        type: ChangelogChangeType.Added,
        text: 'New admins get a short setup that picks the video folder and finds VLC, so videos play right away.',
      },
      { type: ChangelogChangeType.Added, text: 'Admins can run the setup again from the Settings page.' },
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
