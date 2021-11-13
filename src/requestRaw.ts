import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { castConfigWithDef } from './castConfigWithDef';
import { APIDef } from './types';
import { http } from './__core__/http';

export const requestRaw = <Data, Params>(
  def: APIDef<Data, Params>,
  params?: Params,
  axiosConfig?: AxiosRequestConfig
): Promise<AxiosResponse<Data>> => {
  const config = castConfigWithDef(def, params);
  const merged = { ...axiosConfig, ...config };

  if (!config.url) {
    return Promise.reject();
  }

  return http.requestRaw(merged);
};
