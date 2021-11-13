import { APIDef, ReqParams, RequestConfig } from '../types';
import { interpolateUrl } from './interpolateUrl';
import { transformFormDataForAttachments } from './transformFormData';

export const castConfigWithDef = <Data, Params extends ReqParams>(
  def: APIDef<Data, Params>,
  params?: Params
): RequestConfig<Params> => {
  const { method, url, baseURL } = def;
  const [interpolatedUrl, restParams] = interpolateUrl(url, params?.params);

  const config = {
    url: interpolatedUrl,
    baseURL,
    method,
    params: restParams,
    data: params?.data,
  } as RequestConfig<Params>;

  return transformFormDataForAttachments(config);
};
