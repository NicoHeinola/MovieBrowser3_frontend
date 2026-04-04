export const getEnvArray = (key: string, separator = ','): string[] => {
  const value = import.meta.env[key];

  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return String(value)
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};
