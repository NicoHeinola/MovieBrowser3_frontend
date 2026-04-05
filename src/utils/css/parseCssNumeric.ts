/**
 * Parses a CSS size string (e.g. '300px', '20rem', '100%') and returns the numeric value.
 * If the input is already a number, it returns it as is.
 * If the input is invalid or cannot be parsed, it returns the fallback value.
 *
 * @param value The CSS size string or number to parse
 * @param fallback The fallback value if parsing fails
 * @returns The numeric part of the CSS size
 */
export const parseCssNumeric = (value: string | number | undefined | null, fallback = 0): number => {
  if (typeof value === 'number') return value;
  if (!value) return fallback;

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};
