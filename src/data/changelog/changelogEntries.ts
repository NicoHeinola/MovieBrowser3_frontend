import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

/**
 * Every version, newest first. The top entry may be the next, unreleased version (`date: null`): its lines collect
 * there until the release dates it, and the changelog page lists them as upcoming. Users who have not seen a released
 * version get the "What's new" popup on their next visit.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: '2.2.0',
    date: null,
    changes: [
      {
        type: ChangelogChangeType.Added,
        text: 'Move episodes to another season or movie in the show editor.',
        details: [
          "Pick the entry from the episode's move menu.",
          'The episode keeps its video file and watch progress.',
        ],
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The show preview video is muted when you start watching the show, keeping your own volume choice.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The "See all results" button in the show search is rounded to match the search menu.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: "Adding a removed episode's video file to another entry in the same save no longer loses the file.",
      },
    ],
  },
  {
    version: '2.1.0',
    date: '2026-11-08',
    changes: [
      {
        type: ChangelogChangeType.Added,
        text: 'Entries are marked completed when you reach the end of their last episode.',
        details: ['Watch status changes show up right away in every open tab.'],
      },
      {
        type: ChangelogChangeType.Added,
        text: 'See how much space your videos take.',
        details: [
          'The dashboard shows the total size of all video files.',
          'A storage chart shows used and free disk space and how much each show takes.',
          'The show editor shows the size of the show, each season and each episode.',
          'The video file check is now "Scan video files" in the settings and measures file sizes too.',
        ],
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Dashboard counts open their admin page: shows, websites, users, or shows with missing episode files.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'New notifications show instantly when many are on screen: the oldest ones make room.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Error and warning notifications stay on screen longer so long messages are easier to read.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Admins can drag video files from a file explorer onto a show entry to add them as episodes.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'No list reloads or reshuffles anymore when you play a show whose video file is missing.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Admins edit and add shows on a page of their own instead of in a dialog.',
        details: [
          'Each show has its own link, so a reload keeps it open.',
          'The header previews the title, images and categories as you type.',
          'A side menu jumps between sections and marks the ones with fields to fix.',
          'Leaving or discarding with unsaved changes asks first, and Ctrl+S saves.',
          'While saving, it shows which episode is uploading.',
        ],
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'In Firefox, floating buttons and bars stay visible while a dialog is open.',
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-11-07',
    changes: [
      {
        type: ChangelogChangeType.Changed,
        text: 'Your watch progress on the episode you are watching now updates every 5 seconds instead of every 30.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Missing video files are found and flagged.',
        details: [
          'Admins can filter shows with episodes that have no video file, or whose video file is gone.',
          'Episodes without a video file show a "No video file" label in the show drawer and the edit dialog.',
          'The admin dashboard shows how many episode files are missing.',
          'They are looked for once a day, or right away with a button in Settings.',
        ],
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Show search has more ways to find shows.',
        details: [
          'It also checks descriptions, categories, season and movie names, and can mix words from each.',
          'Filter by the status of a whole show or any entry. The new Mixed option finds partly watched shows.',
          "Filter by a show's minimum and maximum episode count.",
          'Completed shows no longer appear in the Random row, and the search page hides them by default.',
          'Show pages fit the number of shows per page to your screen, so a full page fills the screen.',
        ],
      },
      {
        type: ChangelogChangeType.Added,
        text: 'The home page banner reacts more.',
        details: [
          'It goes back to normal a while after you stop hovering a latest show.',
          'It changes on its own when there are several default images.',
        ],
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Preview the home page backgrounds and videos, with or without the latest shows and navigation bar.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Continue watching cards show a loader while the video player opens.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Reordering the frontpage categories confirms when the new order is saved.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Dragging a row to the edge of a long list scrolls the list.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Error messages from the server appear in your language.',
      },
      {
        type: ChangelogChangeType.Added,
        text: 'Long updates on the changelog page are shortened, with a "Read more" button to show the rest.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'First-time setup has a new centered look.',
        details: [
          'Its last step takes you straight to the home page.',
          'It suggests a video folder on a Windows drive, so VLC can open your videos.',
          'The "Save anyway" button is gone. Only paths that pass the check are saved.',
          String.raw`Windows paths such as G:\Videos are no longer accepted. Use /mnt/g/Videos instead.`,
        ],
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The app has a new glass look.',
        details: ['The login page, side drawers, menus and dropdowns.', 'Main buttons look the same across the app.'],
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Videos in the show editor and settings open a muted preview when clicked, instead of playing in place.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The show drawer has smaller season cards, and its buttons fit their text on smaller screens.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'The loading bar at the top is thicker and shows on every page, including login and setup.',
      },
      {
        type: ChangelogChangeType.Changed,
        text: 'Loading placeholders only appear when a page takes a moment to load, so fast pages no longer flicker.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Videos open in VLC when a show, entry or episode name ends in a dot or has characters Windows forbids.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Your next search or filter reflects a watch status you just changed, instead of up to a minute later.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: '"Add another" buttons in the show editor no longer sit right against the items above them.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Editing a show no longer fails when the app is opened from another device on the network.',
      },
      {
        type: ChangelogChangeType.Fixed,
        text: 'Button text and icons are no longer oversized in the installed app.',
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
