export const deepClone = <T>(obj: T): T => {
  // If has methods:
  if (obj && typeof obj === 'object' && typeof obj.constructor === 'function') {
    // eslint-disable-next-line
    return JSON.parse(JSON.stringify(obj));
  }

  return structuredClone(obj);
};
