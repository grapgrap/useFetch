import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act, renderHook } from 'tests/renderHook';
import { http } from '../http';
import { TOKEN_REFRESH_URL } from '../token';
import { Token } from '../types';
import { useToken } from '../useToken';

const server = setupServer(
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

describe('useToken Hook Test', () => {
  it('훅은 http 모듈의 토큰 유무를 확인 할 수 있다.', () => {
    const { result } = renderHook(() => useToken());
    expect(result.current.hasToken).toBe(false);
  });

  it('훅은 http 모듈에 토큰을 설정 할 수 있다.', () => {
    const { result } = renderHook(() => useToken());

    expect(result.current.hasToken).toBe(false);

    act(() => {
      result.current.setToken('test-access-token', 'test-refresh-token');
    });

    expect(result.current.hasToken).toBe(true);
  });

  it('훅은 http 모듈의 토큰 리프래시를 실행 할 수 있다.', async () => {
    const { result } = renderHook(() => useToken());
    result.current.setToken('', 'mock-refresh-token');

    expect(result.current.hasToken).toBe(false);

    await act(() => {
      return result.current.refreshToken();
    });

    expect(result.current.hasToken).toBe(true);
  });

  it('훅은 http 모듈의 토큰을 날릴수 있다.', async () => {
    const { result } = renderHook(() => useToken());

    act(() => {
      result.current.setToken('test-access-token', 'test-refresh-token');
    });

    expect(result.current.hasToken).toBe(true);

    act(() => {
      result.current.blowToken();
    });

    expect(result.current.hasToken).toBe(false);
  });
});
