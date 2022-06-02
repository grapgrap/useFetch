import {
  render as _render,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { FC, ReactElement } from 'react';
import { TestSWRConfig } from './SWRConfig';

type Props = {
  children: ReactElement;
};

const Wrapper: FC<Props> = ({ children }) => {
  return <TestSWRConfig>{children}</TestSWRConfig>;
};

const render = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'queries'> = {}
): RenderResult => {
  const { wrapper: OptionWrapper, ...rest } = options;

  return _render(ui, {
    wrapper: ({ children, ...props }) => {
      return OptionWrapper ? (
        <Wrapper>
          <OptionWrapper {...props}>{children}</OptionWrapper>
        </Wrapper>
      ) : (
        <Wrapper {...props}>{children}</Wrapper>
      );
    },
    ...rest,
  });
};

export { render };
