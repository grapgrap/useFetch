import { FC, ReactElement } from 'react';
import { SWRConfig } from 'swr';

type Props = {
  children: ReactElement;
};

export const TestSWRConfig: FC<Props> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        dedupingInterval: 0,
        provider: () => new Map(),
        suspense: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
