import { transformFormDataForAttachments } from '../transformFormData';

describe('transformFormData Function Test', () => {
  const data = {
    name: 'grapgrap',
    file: new File([], 'test-file-stub'),
  };

  it('함수는 form data에서 파일이 검출 되었을 때 FormData로 변환한다.', () => {
    const transformed = transformFormDataForAttachments({
      method: 'POST',
      data,
    });

    expect(transformed.method).toBe('POST');
    expect(transformed.data).toBeInstanceOf(FormData);
  });

  it('함수는 GET 에서는 변환을 수행하지 않는다.', () => {
    const transformed = transformFormDataForAttachments({
      method: 'GET',
      data,
    });

    expect(transformed.data).not.toBeInstanceOf(FormData);
    expect(transformed).toEqual({ method: 'GET', data });
  });

  it('함수는 form data 에서 파일이 검출 되지 않았으면 변환을 수행하지 않는다.', () => {
    const transformed = transformFormDataForAttachments({
      method: 'POST',
      data: { name: 'grapgrap' },
    });

    expect(transformed.data).not.toBeInstanceOf(FormData);
  });

  it('함수는 data가 넘어오지 않으면 변환을 수행하지 않는다.', () => {
    const transformed = transformFormDataForAttachments({ method: 'POST' });
    expect(transformed).toEqual({ method: 'POST' });
  });

  it('함수는 변환을 수행 할때 append 할 수 있는 데이터만 append 한다.', () => {
    const transformed = transformFormDataForAttachments({
      method: 'POST',
      data: {
        name: 'grapgrap',
        file: new File([], 'test-file-stub'),
        not_appendable: {},
      },
    });

    const compare = new FormData();
    compare.append('name', 'grapgrap');
    compare.append('file', new File([], 'test-file-stub'));

    expect(transformed.data).toEqual(compare);
  });
});
