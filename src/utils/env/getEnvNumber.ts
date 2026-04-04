export const getEnvNumber = (key: string): number => {
  const value = import.meta.env[key];

  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${key}`);
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new TypeError(`Environment variable ${key} is not a valid number: "${value}"`);
  }

  return parsed;
};
