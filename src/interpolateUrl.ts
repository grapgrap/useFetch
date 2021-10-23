import { ReqParams } from './types';

const startBracket = '{' as const;
const endBracket = '}' as const;

const isPrimitive = (value: unknown): value is string | number | boolean => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
};

export const interpolateUrl = (
  origin: string,
  params: ReqParams['params']
): [url: string | undefined, rest: ReqParams['params']] => {
  if (!params) {
    if (origin.includes(startBracket)) return [undefined, undefined];
    return [origin, undefined];
  }

  const copiedParams = { ...params };
  const entries = Object.entries(copiedParams);
  let result = origin;

  for (const entry of entries) {
    if (!result.includes(startBracket)) {
      break;
    }

    const [key, value] = entry;
    const target = `${startBracket}${key}${endBracket}`;

    if (result.includes(target) && isPrimitive(value)) {
      result = result.replace(target, encodeURIComponent(value));
      delete copiedParams[key];
    }
  }

  if (result.includes(startBracket) && result.includes(endBracket)) {
    throw Error(
      '[interpolateUrl]: There is param did not be interpolated. Please check url and params.'
    );
  }

  if (result.includes(startBracket) || result.includes(endBracket)) {
    throw Error(
      '[interpolateUrl]: Remain param cannot be interpolated. Please check url.'
    );
  }

  return [result, { ...copiedParams }];
};
