import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/**
 * Every version, newest first. The top entry may be the next, unreleased version (`date: null`): its lines collect
 * there until the release dates it, and the changelog page lists them as upcoming. Users who have not seen a released
 * version get the "What's new" popup on their next visit.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: null,
    changes: [
      {
        type: ChangelogChangeType.Added,
        text: 'Preview how backgrounds and videos look on the home page, before or after saving them.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Videos in the show editor and settings open a muted preview when clicked, instead of playing in place.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The video file check in Settings warns you and shows how many video files are missing.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The video file check also runs when the video folder is empty.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'The admin dashboard shows how many episode files are missing.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Videos open in VLC when a show, entry or episode name ends in a dot or has characters Windows forbids.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The home page banner goes back to normal a while after you stop hovering a latest show.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The home page banner changes on its own when there are several default images.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: '"Add another" buttons in the show editor no longer sit right against the items above them.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Continue watching cards show a loader while the video player opens.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The show search pages fit the number of shows per page to your screen, so a full page fills the screen.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'First-time setup has a new centered look, and its last step takes you straight to the home page.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Setup suggests a video folder on a Windows drive, so VLC can open your videos.',
      },
      {
        type: ChangelogChangeType.Removed,
        text: 'Setup no longer has the "Save anyway" button. Only paths that pass its check are saved.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Setup explains a failed path check in your language.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: String.raw`Windows paths such as G:\Videos are no longer accepted. Use /mnt/g/Videos instead.`,
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The loading bar now sits at the top of every page, including login and setup.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The login page has a new glass look, and main buttons look the same across the app.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Side drawers, menus and dropdowns have a new glass look.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The loading bar at the top is thicker, so it is easier to see.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Error messages from the server now appear in your language.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Show search also checks descriptions, categories, season and movie names, and can mix words from each.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'The changelog shows what is coming in the next version, and still marks the latest released one.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Loading placeholders only appear when a page takes a moment to load, so fast pages no longer flicker.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Shows you have completed no longer appear in the Random row, and the search page hides them by default.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Filter by the status of a whole show or any entry. The new Mixed option finds partly watched shows.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Your next search or filter reflects a watch status you just changed, instead of up to a minute later.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Reordering the frontpage categories now confirms when the new order is saved.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The show drawer has smaller season cards.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'The set status and watch buttons in the show drawer fit their text, also on smaller screens.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Episodes without a video file show a "No video file" label in the show drawer and the edit dialog.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Missing video files are looked for once a day, or right away with a new button in Settings.',
      },
    ],
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
