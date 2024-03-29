import { AxiosRequestConfig } from 'axios';
import stringify from 'fast-json-stable-stringify';
import { useMemo } from 'react';
import useSWR, { KeyedMutator, SWRConfiguration } from 'swr';
import { APIDef, APIError } from './types';
import { castConfigWithDef, http } from './__core__';

type UseFetch<Data> = {
  data?: Data;
  error?: APIError;
  loading: boolean;
  mutate: KeyedMutator<Data>;
};

export const useFetch = <Data, Params>(
  def?: APIDef<Data, Params>,
  params?: Params,
  options: {
    axiosConfig?: AxiosRequestConfig;
    swrConfig?: SWRConfiguration<Data>;
  } = {}
): UseFetch<Data> => {
  const { axiosConfig, swrConfig } = options;

  const config = def ? castConfigWithDef(def, params) : { url: undefined };
  const merged = { ...axiosConfig, ...config };

  const key = config.url ? stringify(merged) : null;
  const { data, error, mutate, isValidating } = useSWR<Data>(
    key,
    !merged.url ? null : () => http.request<Data, Params>(merged),
    { ...swrConfig }
  );

  return useMemo(
    () => ({
      data,
      error,
      loading: isValidating,
      mutate,
    }),
    [data, error, isValidating, mutate]
  );
};
