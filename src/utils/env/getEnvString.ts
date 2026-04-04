export const getEnvString = (key: string): string => {
  const value = import.meta.env[key];

  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return String(value);
};
