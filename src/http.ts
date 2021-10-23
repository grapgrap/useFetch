import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import stringify from 'fast-json-stable-stringify';
import { history } from 'src/history';
import { TokenManager, TOKEN_EXPIRED } from './token';
import { APIError, ReqParams, RequestConfig } from './types';

const BASE_URL = process.env.EXT_API_BASE_URL;

type HttpOptions = {
  baseURL: string;
  tokenFallbackURL: string;
};

class Http {
  private _instance: AxiosInstance;
  private _token: TokenManager;
  private _onGoingReq: Map<string, Promise<AxiosResponse<unknown>>>;
  private _tokenFallbackUrl: string;

  constructor({ baseURL, tokenFallbackURL }: HttpOptions) {
    this._instance = axios.create({ baseURL });
    this._token = new TokenManager(this);
    this._onGoingReq = new Map();
    this._tokenFallbackUrl = tokenFallbackURL;
  }

  private async _retryAfterRefreshToken<T, P extends ReqParams>(
    origin: RequestConfig<P>
  ): Promise<AxiosResponse<T>> {
    try {
      await this._token.refresh();
    } catch (e) {
      const from = `${history.location.pathname}${history.location.search}`;
      history.replace('/login', { from });
      throw e;
    }
    return this.requestRaw<T, P>(origin, false);
  }

  public get instance(): AxiosInstance {
    return this._instance;
  }

  public get token(): TokenManager {
    return this._token;
  }

  public async requestRaw<T, P extends ReqParams>(
    config: RequestConfig<P>,
    shouldRetryWhenTokenExpired = true
  ): Promise<AxiosResponse<T>> {
    const key = stringify(config);

    try {
      const duplicatedRequest = this._onGoingReq.get(key) as Promise<
        AxiosResponse<T>
      >;

      if (duplicatedRequest) {
        return await duplicatedRequest;
      }

      const currentRequest = this._instance.request<T>(config);
      this._onGoingReq.set(key, currentRequest);

      return await currentRequest;
    } catch (e) {
      const error = e as AxiosError<APIError>;
      const { response } = error;

      const isTokenExpired = response && response.data.code === TOKEN_EXPIRED;
      const isAbleToRetry = isTokenExpired && shouldRetryWhenTokenExpired;

      if (!isAbleToRetry) {
        throw error;
      }

      return this._retryAfterRefreshToken<T, P>(config);
    } finally {
      this._onGoingReq.delete(key);
    }
  }

  public async request<T, P extends ReqParams>(
    config: RequestConfig<P>,
    shouldRetryWhenTokenExpired = true
  ): Promise<T> {
    try {
      const { data } = await this.requestRaw<T, P>(
        config,
        shouldRetryWhenTokenExpired
      );
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
  tokenFallbackURL: '/login',
});
