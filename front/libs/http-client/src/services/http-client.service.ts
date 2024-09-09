/**
 * @see Axios Request Configuration documentation
 * https://axios-http.com/docs/req_config
 *
 */
import type { AxiosResponse, Method } from 'axios';
import axios from 'axios';

import { objectToFormData } from '@fc/common';
import { ConfigService } from '@fc/config';

import { Methods, Options } from '../enums';
import { AxiosException } from '../errors';
import type {
  GetCsrfTokenResponseInterface,
  HttpClientConfig,
  HttpClientDataInterface,
  HttpClientOptionsInterface,
} from '../interfaces';
import { getRequestOptions } from '../utils';

export const makeRequest = async (
  method: Method,
  endpoint: string,
  data: HttpClientDataInterface | URLSearchParams = {},
  axiosOptions: HttpClientOptionsInterface = {},
): Promise<AxiosResponse> => {
  const requestTarget = { data, method, url: endpoint };
  const request = getRequestOptions(requestTarget, axiosOptions);
  return axios.request(request);
};

/**
 *
 * @param data URLSearchParams
 * @returns
 */
export const getCSRF = async (): Promise<GetCsrfTokenResponseInterface> => {
  try {
    const { apiCsrfURL } = ConfigService.get<HttpClientConfig>(Options.CONFIG_NAME);

    const method = Methods.GET;
    const endpoint = apiCsrfURL;
    const { data } = await makeRequest(method, endpoint);
    return data;
  } catch (err) {
    throw new AxiosException('Error while trying to get CSRF token');
  }
};

/**
 *
 * @param endpoint Relative leading slashed string to a single API entry point (eg: '/hello-world')
 * @param data HttpClientDataInterface | URLSearchParams
 * @param axiosOptions AxiosRequestConfig
 * @returns
 */
export const get = async <T = unknown>(
  endpoint: string,
  data?: HttpClientDataInterface | URLSearchParams,
  options?: HttpClientOptionsInterface,
): Promise<AxiosResponse<T>> => {
  try {
    const method = Methods.GET;
    return await makeRequest(method, endpoint, data, options);
  } catch (err) {
    throw new AxiosException((err as Error).message);
  }
};

/**
 *
 * @param endpoint Relative leading slashed string to a single API entry point (eg: '/hello-world')
 * @param data HttpClientDataInterface
 * @param axiosOptions AxiosRequestConfig
 * @returns
 */
export const post = async (
  endpoint: string,
  data?: HttpClientDataInterface,
  options?: HttpClientOptionsInterface,
): Promise<AxiosResponse> => {
  try {
    const { csrfToken } = await getCSRF();

    const method = Methods.POST;
    const datas = { ...data, _csrf: csrfToken };
    const axiosConfig = { transformRequest: objectToFormData, ...options };
    return await makeRequest(method, endpoint, datas, axiosConfig);
  } catch (err) {
    throw new AxiosException((err as Error).message);
  }
};
