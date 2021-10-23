import {
  render as _render,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { FC } from 'react';
import { TestSWRConfig } from './SWRConfig';

const Wrapper: FC = ({ children }) => {
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

export * from '@testing-library/react';
export { render };
