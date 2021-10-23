import { interpolateUrl } from '../interpolateUrl';

describe('interpolateUrl Function Test', () => {
  it('함수는 보간 대상이 있을 때, param 에서 보간 값을 찾아 보간을 수행한다.', () => {
    const [url, rest] = interpolateUrl('/some-url/{target}/', {
      target: 'interpolated',
      some: 'rest param',
    });

    expect(url).toBe('/some-url/interpolated/');
    expect(rest).toEqual({ some: 'rest param' });
  });

  it('함수는 url 을 빈 스트링으로 받았을 때 빈 스트링을 반환한다.', () => {
    const [emptyUrl] = interpolateUrl('', {});
    expect(emptyUrl).toBe('');
  });

  it('함수는 url을 빈 스트링으로 받았을 때 param이 있어도 빈 스트링을 반환한다.', () => {
    const [hasParamResult] = interpolateUrl('', { some: 'weird' });
    expect(hasParamResult).toBe('');
  });

  it('함수는 url에 보간 대상이 있음에도 param이 undefined 이면, url을 undefined를 반환한다.', () => {
    // ? url이 undefined 여야 하는 이유는 useSWR의 스펙을 맞추기 위함이다.

    const [url] = interpolateUrl('/some-url/{target}', undefined);
    expect(url).toBeUndefined();
  });

  it('함수는 보간 대상이 없으면 원 url을 그대로 반환한다.', () => {
    const origin = '/some-url/';
    const [url] = interpolateUrl(origin, undefined);
    expect(url).toBe(origin);
  });

  it('함수에 사용된 param은 immutable 하게 관리 되어야 한다.', () => {
    const param: { target?: string; some: 'rest' } = {
      target: 'interpolated',
      some: 'rest',
    };
    const [, rest] = interpolateUrl('/some-url/{target}', param);

    delete param.target;

    expect(rest).toEqual(param);
    expect(rest).not.toBe(param);
  });

  describe('함수는 보간 값으로 number, string, boolean 값만 사용 할 수 있다.', () => {
    it('nested object', () => {
      const nestedObject = {
        target: { nested: 'object' },
      };

      expect(() => {
        interpolateUrl('/some-url/{target}', nestedObject);
      }).toThrow();
    });

    it('function', () => {
      const param = {
        target: () => {
          return undefined;
        },
      };

      expect(() => {
        interpolateUrl('/some-url/{target}', param);
      }).toThrow();
    });
  });

  describe('함수는 보간 값을 `{` 와 `}` 의 쌍으로 판단한다.', () => {
    it('`{` 만 있는 경우', () => {
      expect(() => {
        interpolateUrl('/some-url/{target', {
          target: 'interpolated',
        });
      }).toThrow();
    });

    it('`}`만 있는 경우', () => {
      expect(() => {
        interpolateUrl('/some-url/target}', {
          target: 'interpolated',
        });
      }).toThrow();
    });
  });
});
