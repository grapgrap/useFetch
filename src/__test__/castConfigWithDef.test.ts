import { castConfigWithDef } from '../castConfigWithDef';
import * as interpolateUrlModule from '../interpolateUrl';
import * as transformFormDataModule from '../transformFormData';

describe('castConfigWithDef Function Test', () => {
  it('함수는 APIDef를 RequestConfig으로 캐스팅한다.', () => {
    const casted = castConfigWithDef({
      method: 'GET',
      url: '/test-url-stub',
    });

    expect(casted).toEqual({ method: 'GET', url: '/test-url-stub' });
  });

  it('함수는 param을 넘겨 받을 수 있다.', () => {
    const casted = castConfigWithDef(
      {
        method: 'GET',
        url: '/test-url-stub',
      },
      {
        params: {
          id: 123,
        },
        data: {
          name: 'grapgrap',
        },
      }
    );

    expect(casted).toEqual({
      method: 'GET',
      url: '/test-url-stub',
      params: { id: 123 },
      data: { name: 'grapgrap' },
    });
  });

  it('함수는 interpolateUrl과 transformFormDataForAttachments를 사용하여 캐스팅 한다.', () => {
    const interpolateUrlSpy = jest.spyOn(
      interpolateUrlModule,
      'interpolateUrl'
    );
    const transformFormDataForAttachments = jest.spyOn(
      transformFormDataModule,
      'transformFormDataForAttachments'
    );

    castConfigWithDef({
      method: 'GET',
      url: '/test-url-stub',
    });

    expect(interpolateUrlSpy).toBeCalledWith('/test-url-stub', undefined);
    expect(transformFormDataForAttachments).toBeCalledWith({
      url: '/test-url-stub',
      method: 'GET',
    });
  });
});
