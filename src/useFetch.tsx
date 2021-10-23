import { AxiosRequestConfig } from 'axios';
import stringify from 'fast-json-stable-stringify';
import { useMemo } from 'react';
import useSWR, { KeyedMutator, SWRConfiguration } from 'swr';
import { castConfigWithDef } from './castConfigWithDef';
import { http } from './http';
import { APIDef, APIError } from './types';

type UseFetch<Data> = {
  data?: Data;
  error?: APIError;
  loading: boolean;
  mutate: KeyedMutator<Data>;
};

export const useFetch = <Data, Params>(
  def: APIDef<Data, Params>,
  params?: Params,
  fallbackData?: Data,
  options: {
    axiosConfig?: AxiosRequestConfig;
    swrConfig?: SWRConfiguration<Data>;
  } = {}
): UseFetch<Data> => {
  const { axiosConfig, swrConfig } = options;

  const config = castConfigWithDef(def, params);
  const merged = { ...axiosConfig, ...config };

  const key = config.url ? stringify(merged) : null;
  const { data, error, mutate, isValidating } = useSWR<Data, APIError>(
    key,
    () => http.request<Data, Params>(merged),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      fallbackData,
      ...swrConfig,
    }
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
