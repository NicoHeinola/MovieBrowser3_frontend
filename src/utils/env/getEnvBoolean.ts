export const getEnvBoolean = (key: string): boolean => {
  const value = import.meta.env[key];

  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${key}`);
  }

  const normalized = String(value).toLowerCase().trim();

  if (normalized !== 'true' && normalized !== 'false') {
    throw new TypeError(`Environment variable ${key} must be "true" or "false", got: "${value}"`);
  }

  return normalized === 'true';
};
