import { FC, ReactElement } from 'react';
import { TestSWRConfig } from './SWRConfig';

type Props = Record<string, unknown> & {
  children: ReactElement;
};

export const Wrapper: FC<Props> = ({ children }) => {
  return <TestSWRConfig>{children}</TestSWRConfig>;
};
