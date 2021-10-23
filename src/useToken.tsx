import { useCallback, useState } from 'react';
import { http } from './http';

type UseToken = {
  hasToken: boolean;
  setToken: (accessToken: string, refreshToken: string) => void;
  refreshToken: () => Promise<void>;
  blowToken: () => void;
};

export const useToken = (): UseToken => {
  const [hasToken, setHasToken] = useState(!!http.token.has);

  const _updateTokenState = useCallback(() => {
    setHasToken(!!http.token.has);
  }, []);

  const setToken = useCallback(
    (accessToken: string, refreshToken: string) => {
      http.token.set(accessToken, refreshToken);
      _updateTokenState();
    },
    [_updateTokenState]
  );

  const refreshToken = useCallback(async () => {
    await http.token.refresh();
    _updateTokenState();
  }, [_updateTokenState]);

  const blowToken = useCallback(() => {
    http.token.blow();
    _updateTokenState();
  }, [_updateTokenState]);

  return {
    hasToken,
    setToken,
    refreshToken,
    blowToken,
  };
};
