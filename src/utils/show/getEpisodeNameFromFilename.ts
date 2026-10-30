/** Matches a short trailing file extension such as `.mkv`. */
const extensionPattern = /\.[a-z0-9]{2,4}$/i;

/** Matches bracketed release tags such as `[Group]`, `(Dual Audio)` or `{Hash}`. */
const bracketedTagPattern = /\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g;

/** Matches release version suffixes such as `v2`. */
const versionTagPattern = /\bv\d+\b/gi;

/** Release metadata tokens such as resolution, source, codec or audio tags. */
const releaseMetadataTokens = [
  String.raw`\d{3,4}p`,
  '[48]k',
  'web(?:-?dl|-?rip)?',
  'hdtv',
  'blu-?ray',
  'bd(?:rip)?',
  'dvd(?:rip)?',
  'remux',
  String.raw`[xh]\.?26[45]`,
  'hevc',
  'av1',
  'aac',
  'flac',
  '10bit',
  'hdr',
  'dual[ -]audio',
  'multi[ -]subs?',
];

/** Matches the first release metadata token; everything from it onwards is dropped. */
const releaseMetadataPattern = new RegExp(String.raw`\b(?:${releaseMetadataTokens.join('|')})\b.*$`, 'i');

/** Matches a season/episode marker such as `S01E04`. */
const seasonEpisodePattern = /\bs\d+e\d+\b/i;

/**
 * Derive a readable episode name from a release filename by stripping the extension,
 * release group, quality and version tags, and normalizing the episode marker.
 *
 * @param filename The original file name, e.g. `[Group] Show - S01E04 [1080p].mkv`.
 * @returns The cleaned name, e.g. `Show - S01E04`, or "Untitled" when nothing remains.
 */
export const getEpisodeNameFromFilename = (filename: string): string => {
  let name = filename.replace(extensionPattern, '').replace(bracketedTagPattern, ' ').replace(/_+/g, ' ');

  if (!name.includes(' ')) {
    name = name.replace(/\.+/g, ' ');
  }

  name = name
    .replace(releaseMetadataPattern, '')
    .replace(versionTagPattern, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.-]+|[\s.-]+$/g, '');

  const seasonEpisodeMatch = seasonEpisodePattern.exec(name);

  if (seasonEpisodeMatch) {
    const { 0: marker, index } = seasonEpisodeMatch;
    const title = name.slice(0, index).replace(/[\s-]+$/, '');
    const episode = `${marker.toUpperCase()}${name.slice(index + marker.length)}`;

    name = title === '' ? episode : `${title} - ${episode}`;
  }

  return name === '' ? 'Untitled' : name;
};
