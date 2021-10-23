import { AxiosRequestConfig, Method } from 'axios';

export enum APIStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  CLIENT_ERROR = 'CLIENT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type APIErrorContext = {
  [key: string]: APIErrorContext | Array<string>;
};

export type APIError = {
  code: string;
  message: string;
  context?: APIErrorContext;
};

// Ajax descriptor
export type APIDescriptor<Response> =
  | {
      status: APIStatus.IDLE | APIStatus.LOADING;
      data: undefined;
      error: undefined;
    }
  | {
      status: APIStatus.SUCCESS;
      data: Response;
      error: undefined;
    }
  | {
      status: APIStatus.SERVER_ERROR | APIStatus.CLIENT_ERROR;
      data: undefined;
      error: APIError;
    }
  | {
      status: APIStatus.UNKNOWN_ERROR;
      data: undefined;
      error: APIError;
    };

export type ReqParams = {
  params?: Record<string, unknown>;
  data?: Record<string | number, unknown>;
  // Prevent typo
  param?: never;
  body?: never;
};

export type RequestConfig<P extends ReqParams> = P &
  Omit<AxiosRequestConfig, 'params' | 'data'>;

export type Token = {
  access_token: string;
  refresh_token: string;
};

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
