const isDate = (value: unknown): value is Date => value instanceof Date;

const isBlob = (value: unknown): value is Blob => value instanceof Blob;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !isDate(value) && !isBlob(value);

const appendValue = (formData: FormData, path: string, value: unknown): void => {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    formData.append(path, '');
    return;
  }

  if (isDate(value)) {
    formData.append(path, value.toISOString());
    return;
  }

  if (isBlob(value)) {
    formData.append(path, value);
    return;
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      appendValue(formData, `${path}[${index}]`, item);
    }
    return;
  }

  if (isRecord(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      appendValue(formData, `${path}[${key}]`, nestedValue);
    }
    return;
  }

  formData.append(path, String(value));
};

/**
 * Converts an object into FormData using bracket notation for nested values.
 *
 * @param payload Object payload to serialize
 * @returns FormData instance representing the payload
 */
export const toFormData = (payload: object): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    appendValue(formData, key, value);
  }

  return formData;
};
