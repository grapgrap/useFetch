import { AxiosRequestConfig } from 'axios';
import { castConfigWithDef } from './castConfigWithDef';
import { http } from './http';
import { APIDef } from './types';

export const request = <Data, Params>(
  def: APIDef<Data, Params>,
  params?: Params,
  axiosConfig?: AxiosRequestConfig
): Promise<Data> => {
  const config = castConfigWithDef(def, params);
  const merged = { ...axiosConfig, ...config };

  if (!config.url) {
    return Promise.reject();
  }

  return http.request(merged);
};
