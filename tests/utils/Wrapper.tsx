import { ReactElement, ReactNode } from 'react';
import { TestSWRConfig } from './SWRConfig';

type Props = {
  children?: ReactNode;
};

export function Wrapper({ children }: Props): ReactElement {
  return <TestSWRConfig>{children}</TestSWRConfig>;
}
