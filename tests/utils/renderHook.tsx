import { renderHook as _renderHook } from '@testing-library/react-hooks';
import { Wrapper } from './Wrapper';

const renderHook: typeof _renderHook = (callback, options = {}) => {
  const { wrapper: OptionWrapper, ...rest } = options;

  return _renderHook(callback, {
    wrapper: (props) => {
      return OptionWrapper ? (
        <Wrapper>
          <OptionWrapper {...props} />
        </Wrapper>
      ) : (
        <Wrapper {...props} />
      );
    },
    ...rest,
  });
};

export * from '@testing-library/react-hooks';
export { renderHook };
