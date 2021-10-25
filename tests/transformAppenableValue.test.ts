import { transformAppendableValue } from '../src/transformAppendableValue';

describe('transformAppendableValue Function Test', () => {
  describe('함수는 입력된 값이 FormData에 append 될 수 있도록 입력된 값을 변환한다.', () => {
    it('number 인 경우', () => {
      const transformed = transformAppendableValue(29);
      expect(transformed).toBe('29');
    });

    it('boolean 인 경우', () => {
      const transformed = transformAppendableValue(true);
      expect(transformed).toBe('true');
    });

    it('string 인 경우', () => {
      const transformed = transformAppendableValue('grapgrap');
      expect(transformed).toBe('grapgrap');
    });

    it('blob 인 경우', () => {
      const transformed = transformAppendableValue(new File([], 'file-name'));
      expect(transformed).toEqual(new File([], 'test-file.stub'));
    });
  });

  it('append 할 수 없는 값인 경우', () => {
    const transformed = transformAppendableValue({});
    expect(transformed).toBeUndefined();
  });

  it('undefined 인 경우', () => {
    const transformed = transformAppendableValue(undefined);
    expect(transformed).toBeUndefined();
  });

  it('null 인 경우', () => {
    const transformed = transformAppendableValue(null);
    expect(transformed).toBeUndefined();
  });
});
