import { BridgePayload, BridgeResponse } from "@fc/hybridge-http-proxy";
import { LoggerService } from "@fc/logger";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class CsmrHttpProxyService {
  constructor(
    private readonly logger: LoggerService,
    private http: HttpService,
  ) {}

  /**
   * get the data from FI based on Bridge request params
   * @param {HttpProxyRequest} options
   * @returns {Promise<HttpProxyResponse>}
   */
  async forwardRequest(commands: BridgePayload): Promise<BridgeResponse> {
    const {
      url,
      method,
      headers: requestHeaders,
      data: requestData,
    } = commands;

    const config: AxiosRequestConfig = {
      headers: requestHeaders,
    };

    const options: Array<unknown> = [url, requestData, config].filter(Boolean);

    this.logger.debug({
      config,
      method,
      msg: `${method.toUpperCase()} ${url}`,
      requestData,
      url,
    });
    const { status, statusText, headers, data } = await lastValueFrom<
      AxiosResponse<string>
    >(this.http[method](...options));

    this.logger.debug({
      data,
      headers,
      method,
      msg: `${method.toUpperCase()} ${url} ${status}`,
      status,
      statusText,
      url,
    });

    const response: BridgeResponse = {
      status,
      data,
      statusText,
      headers: headers as Record<string, string>,
    };

    return response;
  }
}
