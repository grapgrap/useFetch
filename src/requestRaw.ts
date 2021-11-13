import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIDef } from './types';
import { castConfigWithDef, http } from './__core__';

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
