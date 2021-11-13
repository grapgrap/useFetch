import { isNil } from '../utils/isNil';

export const transformAppendableValue = (
  value: unknown
): string | Blob | undefined => {
  if (isNil(value)) return undefined;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'string' || value instanceof Blob) {
    return value;
  }
};
