import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { http } from '../src/http';
import { APIDef } from '../src/types';
import { useFetch } from '../src/useFetch';
import { renderHook } from './utils/renderHook';

const server = setupServer(
  rest.get('/test-url-stub/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: '12345' }));
  }),
  rest.get('/test-url/:stub/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        stub: req.params.stub,
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

afterEach(async () => {
  server.resetHandlers();
});

describe('useFetch Hook Test', () => {
  const def: APIDef<never, never> = {
    method: 'GET',
    url: '/test-url-stub/',
  };

  const needInterpolateDef: APIDef<never, { params: { stub: string } }> = {
    method: 'GET',
    url: '/test-url/{stub}/',
  };

  const requestSpy = jest.spyOn(http, 'request');

  it('훅은 APIDef를 통해 정의된 API 스펙으로 API 호출을 한다.', async () => {
    const { result, waitFor } = renderHook(() => useFetch(def));
    expect(requestSpy).toBeCalledWith(def);

    await waitFor(() => !result.current.loading);
  });

  it('훅은 수신한 데이터를 data에 반환한다.', async () => {
    const { result, waitFor } = renderHook(() => useFetch(def));

    await waitFor(() => !!result.current.data);

    expect(result.current.data).toEqual({ id: '12345' });
  });

  it('훅은 수신한 에러를 error에 반환한다.', async () => {
    server.use(
      rest.get('/test-url-stub/', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            code: 'SOME_API_ERROR',
            message: 'Something went wrong',
          })
        );
      })
    );

    const { result, waitFor } = renderHook(() => useFetch(def));

    await waitFor(() => !!result.current.error);

    expect(result.current.error).toEqual({
      code: 'SOME_API_ERROR',
      message: 'Something went wrong',
    });
  });

  it('API Def의 url은 interpolated 될 수 있다.', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useFetch(needInterpolateDef, { params: { stub: 'stub' } })
    );

    await waitForValueToChange(() => result.current.data);

    expect(result.current.data).toEqual({ stub: 'stub' });
  });

  it('API Def의 url이 interpolated 될 수 없으면, API를 호출 하지 않는다.', () => {
    renderHook(() => useFetch(needInterpolateDef));
    expect(requestSpy).not.toBeCalled();
  });
});
