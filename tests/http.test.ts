import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { http } from 'src/__core__/http';

const success = { status: 'success' };
const error = { code: 'server error' };

const server = setupServer(
  rest.get('/get-test/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(success));
  }),
  rest.get('/always-fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(error));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

afterEach(() => {
  server.resetHandlers();
});

describe('Http Module Test', () => {
  const config = { url: '/get-test/', method: 'GET' as const };

  describe('requestRaw 테스트', () => {
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
  });

  describe('request 테스트', () => {
    it('request는 requestRaw를 통해 API를 호출한다.', async () => {
      const requestRawSpy = jest.spyOn(http, 'requestRaw');
      const config = { url: '/get-test', method: 'GET' as const };
      await http.request(config);

      expect(requestRawSpy).toBeCalledTimes(1);
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
        if (e instanceof Error) {
          expect(e.message).toEqual('Network Error');
        }
      }
    });
  });
});
