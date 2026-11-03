/**
 * Reads a string environment variable.
 * @param key - The variable name, such as `VITE_API_URL`.
 * @param fallback - Returned when the variable is missing or empty. Leave it out for required variables.
 * @returns The variable's value, or the fallback.
 */
export const getEnvString = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];

  if (value === undefined || value === '') {
    // Optional variables, such as a version suffix that production leaves empty, use their fallback.
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing environment variable: ${key}`);
  }

  return String(value);
};
