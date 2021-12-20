import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import stringify from 'fast-json-stable-stringify';
import { APIError, ReqParams, RequestConfig } from '../types';

const BASE_URL = process.env.BASE_URL ?? process.env.REACT_APP_BASE_URL ?? '';

type HttpOptions = {
  baseURL: string;
};

type Fetcher = AxiosInstance;

class Http {
  private _fetcher: Fetcher;
  private _onGoingReq: Map<string, Promise<AxiosResponse<unknown>>>;

  constructor({ baseURL }: HttpOptions) {
    this._fetcher = axios.create({ baseURL });
    this._onGoingReq = new Map();
  }

  public async requestRaw<T, P extends ReqParams>(
    config: RequestConfig<P>
  ): Promise<AxiosResponse<T>> {
    const key = stringify(config);
    try {
      const duplicatedRequest = this._onGoingReq.get(key) as Promise<
        AxiosResponse<T>
      >;

      if (duplicatedRequest) {
        return await duplicatedRequest;
      }

      const currentRequest = this._fetcher.request<T>(config);
      this._onGoingReq.set(key, currentRequest);

      return await currentRequest;
    } finally {
      this._onGoingReq.delete(key);
    }
  }

  public async request<T, P extends ReqParams>(
    config: RequestConfig<P>
  ): Promise<T> {
    try {
      const { data } = await this.requestRaw<T, P>(config);
      return data;
    } catch (e) {
      const error = e as AxiosError<APIError>;
      throw error.response?.data ?? error.response ?? error;
    }
  }
}

export type { Http };

export const http = new Http({
  baseURL: BASE_URL,
});
