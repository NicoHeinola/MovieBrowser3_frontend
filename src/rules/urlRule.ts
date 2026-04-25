export const urlRule = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || 'Enter a valid http or https URL';
  } catch {
    return 'Enter a valid http or https URL';
  }
};
