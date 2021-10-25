import { FC } from 'react';
import { SWRConfig } from 'swr';

export const TestSWRConfig: FC = ({ children }) => {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
      }}
    >
      {children}
    </SWRConfig>
  );
};
