import { FC } from 'react';
import { SWRConfig } from 'swr';

export const TestSWRConfig: FC = ({ children }) => {
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        dedupingInterval: 0,
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
};
