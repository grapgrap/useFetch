import axios from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { history } from 'src/history';
import { http } from '../http';
import { TOKEN_EXPIRED, TOKEN_REFRESH_URL } from '../token';
import { Token } from '../types';

const success = { status: 'success' };
const error = { code: 'server error' };

const server = setupServer(
  rest.get('/get-test/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(success));
  }),
  rest.get('/always-fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(error));
  }),
  rest.get('/need-auth/', (req, res, ctx) => {
    const token = req.headers.get('Authorization');

    return token
      ? res(ctx.status(200), ctx.json(success))
      : res(ctx.status(403), ctx.json({ code: TOKEN_EXPIRED }));
  }),
  rest.post(TOKEN_REFRESH_URL, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<Token>({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

afterEach(() => {
  server.resetHandlers();
  http.token.blow();
});

describe('Http Module Test', () => {
  const config = { url: '/get-test/', method: 'GET' as const };

  it('http는 axios instance를 가지고 있다.', () => {
    expect(http.instance).toBeDefined();
  });

  it('http는 token manager를 가지고 있다.', () => {
    expect(http.token).toBeDefined();
  });

  describe('requestRaw 테스트', () => {
    it('requestRaw는 axios instance를 통해 API를 호출한다.', async () => {
      const instanceSpy = jest.spyOn(http.instance, 'request');
      await http.requestRaw(config);

      expect(instanceSpy).toBeCalledTimes(1);
      expect(instanceSpy).toBeCalledWith(config);
    });

    it('응답이 오지 않은 요청을 다시 요청하게 되면 이전에 보낸 요청에 묶는다.', async () => {
      const origin = http.requestRaw(config);
      const duplicated = http.requestRaw(config);

      const [first, second] = await Promise.all([origin, duplicated]);

      expect(first).toStrictEqual(second);
    });

    it('응답이 온 요청을 다시 요청하게 되면 이전 응답을 재사용하지 않는다.', async () => {
      const first = await http.requestRaw(config);
      const second = await http.requestRaw(config);

      expect(first).not.toEqual(second);
    });

    describe('토큰 갱신 시나리오 테스트', () => {
      it('서버에서 token expired 에러를 받으면 갱신 후 실패한 요청을 재시도 한다.', async () => {
        const requestSpy = jest.spyOn(http.instance, 'request');

        // initialize refresh token
        http.token.set(undefined, 'refresh-token');

        await http.requestRaw({
          url: '/need-auth/',
          method: 'GET',
        });

        // origin -> refresh token -> retry origin
        expect(requestSpy).toBeCalledTimes(3);
      });

      it('토큰 갱신 시, 에러가 발생하면 재시도 하지 않는다.', async () => {
        const requestSpy = jest.spyOn(http.instance, 'request');

        server.use(
          rest.post(TOKEN_REFRESH_URL, (req, res, ctx) => {
            return res(ctx.status(403), ctx.json({ code: TOKEN_EXPIRED }));
          })
        );

        // initialize refresh token
        http.token.set(undefined, 'refresh-token');
        try {
          await http.requestRaw({ url: '/need-auth/', method: 'GET' });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            expect(error.response?.data).toEqual({ code: TOKEN_EXPIRED });
          }
        }

        // origin -> refresh token -X-> DEAD END
        expect(requestSpy).toBeCalledTimes(2);
      });

      it('토큰 갱신에 실패 하면, 정의된 fallback url 로 이동한다.', async () => {
        server.use(
          rest.post(TOKEN_REFRESH_URL, (req, res, ctx) => {
            return res(ctx.status(401), ctx.json({ code: TOKEN_EXPIRED }));
          })
        );

        // initialize refresh token
        http.token.set(undefined, 'refresh-token');
        try {
          await http.requestRaw({ url: '/need-auth/', method: 'GET' });
        } catch (e) {
          expect(history.location.pathname).toBe('/login');
        }
      });

      it('여러 요청에서 토큰 갱신을 시도했을 때 첫 시도에서 실패시 토큰 삭제에 대한 방어', async () => {
        const requestSpy = jest.spyOn(http.instance, 'request');

        server.use(
          rest.get('/need-auth/', (req, res, ctx) => {
            const delay = req.url.searchParams.get('delay');

            return res(
              ctx.delay(Number(delay)),
              ctx.status(403),
              ctx.json({ code: TOKEN_EXPIRED })
            );
          }),

          rest.post(TOKEN_REFRESH_URL, (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.status(403),
              ctx.json({ code: TOKEN_EXPIRED })
            );
          })
        );

        http.token.set('access-token', 'refresh-token');

        // 두 요청 모두 토큰 만료 에러 발생
        // 요청에 대한 결과 값이 "무조건"
        // 1번 요청 -> 갱신 요청 -> 2번 요청이 되도록 delay로 조정.
        const [first, second] = await Promise.allSettled([
          http.requestRaw({ url: '/need-auth?delay=100', method: 'GET' }),
          http.requestRaw({ url: '/need-auth?delay=300', method: 'GET' }),
        ]).then((results) =>
          results.map((res) => res.status === 'rejected' && res.reason.message)
        );

        // - 1번 요청 -> 갱신 -> 실패 (토큰 삭제) -> 갱신 실패 에러
        // - 2번 요청 -> 갱신? (토큰 없음) -> 토큰 없음 에러
        expect(requestSpy).toBeCalledTimes(3);
        expect(first).toBe('Request failed with status code 403');
        expect(second).toBe('[TokenManager] Has no refresh token');
      });
    });
  });

  describe('request 테스트', () => {
    it('request는 requestRaw를 통해 API를 호출한다.', async () => {
      const requestRawSpy = jest.spyOn(http, 'requestRaw');
      const config = { url: '/get-test', method: 'GET' as const };
      await http.request(config);

      expect(requestRawSpy).toBeCalledTimes(1);
    });

    it('request에서 requestRaw를 호출 할 때 shouldRetryWhenTokenExpired의 기본값은 true 이다.', async () => {
      const requestRawSpy = jest.spyOn(http, 'requestRaw');
      const config = { url: '/get-test', method: 'GET' as const };
      await http.request(config);

      expect(requestRawSpy).toBeCalledWith(config, true);
    });

    it('서버 에러가 발생 했을 때 서버 에러가 반환 된다.', async () => {
      try {
        await http.request({ url: '/always-fail/', method: 'GET' });
      } catch (e) {
        expect(e).toEqual(error);
      }
    });

    it('서버 에러에 아무런 값이 없으면, axios error를 반환한다.', async () => {
      server.use(
        rest.get('/network-fail/', (req, res) => {
          return res.networkError('Something went wrong');
        })
      );
      try {
        await http.request({ url: '/network-fail/', method: 'GET' });
      } catch (e) {
        expect(e.message).toEqual('Network Error');
      }
    });
  });
});
