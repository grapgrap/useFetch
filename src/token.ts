import { AxiosError } from 'axios';
import { Http } from './http';
import { APIError, Token } from './types';

export class TokenError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

const TOKEN_PREFIX = 'Bearer' as const;

const REFRESH_TOKEN_KEY = 'EXT_REFRESH_TOKEN' as const;
const ACCESS_TOKEN_KEY = 'EXT_ACCESS_TOKEN' as const;

export const TOKEN_EXPIRED = 'token_expired' as const;
export const TOKEN_REFRESH_URL = '/auth/token/refresh/' as const;

export const HAS_NO_REFRESH_TOKEN = 'HAS_NO_REFRESH_TOKEN' as const;
export const EXPIRED_REFRESH_TOKEN = 'EXPIRED_REFRESH_TOKEN' as const;
export class TokenManager {
  private _accessToken?: string;
  private _refreshToken?: string;
  private fetcher: Http;

  constructor(fetcher: Http) {
    this.fetcher = fetcher;
    this._restoreTokenFromLocalStorage();
  }

  private _restoreTokenFromLocalStorage(): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;

    if (!refreshToken) {
      this.blow();
      return undefined;
    }
    this.set(accessToken, refreshToken);
  }

  public get has(): boolean {
    return !!this._refreshToken && !!this._accessToken;
  }

  public set(accessToken?: string, refreshToken?: string): void {
    this._refreshToken = refreshToken;
    this._accessToken = accessToken;

    if (accessToken) {
      this.fetcher.instance.defaults.headers.common[
        'Authorization'
      ] = `${TOKEN_PREFIX} ${accessToken}`;
    } else {
      delete this.fetcher.instance.defaults.headers.common['Authorization'];
    }

    if (accessToken && refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
  }

  public blow(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    this.set(undefined, undefined);
  }

  public async refresh(): Promise<void> {
    try {
      if (!this._refreshToken) {
        throw new TokenError(
          '[TokenManager] Has no refresh token',
          HAS_NO_REFRESH_TOKEN
        );
      }

      const { data } = await this.fetcher.requestRaw<
        Token,
        { data: Pick<Partial<Token>, 'refresh_token'> }
      >(
        {
          method: 'POST',
          url: TOKEN_REFRESH_URL,
          data: { refresh_token: this._refreshToken },
        },
        false
      );

      const { access_token, refresh_token } = data;
      this.set(access_token, refresh_token);
    } catch (e) {
      const error = e as AxiosError<APIError>;
      const isRefreshTokenExpired = error.response?.data.code === TOKEN_EXPIRED;

      if (isRefreshTokenExpired) {
        this.blow();
      }

      throw error;
    }
  }
}
