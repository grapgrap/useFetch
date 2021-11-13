import { AxiosRequestConfig, Method } from 'axios';

export type ReqParams = {
  params?: Record<string, unknown>;
  data?: Record<string | number, unknown>;
  // Prevent typo
  param?: never;
  body?: never;
};

export type RequestConfig<P extends ReqParams> = P &
  Omit<AxiosRequestConfig, 'params' | 'data'>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type APIDef<Data, Params extends ReqParams> = {
  url: string;
  method: Method;
  baseURL?: string;
};

export type InferModel<T> = T extends APIDef<infer Data, ReqParams>
  ? Data
  : never;

export type InferParams<T> = T extends APIDef<unknown, infer Params>
  ? Params
  : never;
