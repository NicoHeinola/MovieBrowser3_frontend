/** The units a runtime of a minute or more is written in, as `Intl.NumberFormat` names them. */
type RuntimeUnit = 'day' | 'hour' | 'minute';

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * Formats a running time for reading, not for a player: its two largest units, such as `1h 23m` or `2d 5h` in English
 * and `1t 23min` in Finnish. Under a minute shows seconds, so a short clip doesn't read as `0m`.
 * @param seconds - The time in seconds.
 * @param locale - The locale for the unit names.
 * @returns The formatted time.
 */
export const formatRuntime = (seconds: number, locale: string): string => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const format = (value: number, unit: RuntimeUnit | 'second'): string =>
    new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'narrow' }).format(value);

  if (totalSeconds < SECONDS_PER_MINUTE) {
    return format(totalSeconds, 'second');
  }

  const totalMinutes = Math.round(totalSeconds / SECONDS_PER_MINUTE);
  const parts: [number, RuntimeUnit][] = [
    [Math.floor(totalMinutes / MINUTES_PER_DAY), 'day'],
    [Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR), 'hour'],
    [totalMinutes % MINUTES_PER_HOUR, 'minute'],
  ];

  // Starts at the largest unit that isn't 0. Minutes are the last resort, so a time under an hour still has one.
  const largest = parts.findIndex(([value], index) => value > 0 || index === parts.length - 1);

  // The largest unit always shows; the next one only when it isn't 0, so 2 hours reads `2h`, not `2h 0m`.
  return parts
    .slice(largest, largest + 2)
    .filter(([value], index) => index === 0 || value > 0)
    .map(([value, unit]) => format(value, unit))
    .join(' ');
};
