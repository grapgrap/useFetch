import { ReqParams, RequestConfig } from '../types';
import { transformAppendableValue } from './transformAppendableValue';

const isBlob = (value: unknown): value is File | Blob =>
  value instanceof Blob || value instanceof File;

const entries = <T extends Record<string, unknown>, K = string, V = T[keyof T]>(
  object: T
): [K, V][] => {
  return Object.entries(object) as unknown[] as [K, V][];
};

export const transformFormDataForAttachments = <Params extends ReqParams>(
  config: RequestConfig<Params>
): RequestConfig<Params> => {
  const { data, method } = config;

  if (method === 'GET') return config;
  if (!data) return config;

  const fields = entries(data);
  const hasAnyBlobItem = fields.some(([, value]) => isBlob(value));

  if (!hasAnyBlobItem) return config;

  // File / Blob attachment found! Convert to FormData
  const newData = new FormData();
  fields.forEach(([key, value]) => {
    const appendable = transformAppendableValue(value);
    if (appendable !== undefined) newData.append(key, appendable);
  });

  return { ...config, data: newData };
};
