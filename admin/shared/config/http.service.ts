import {
  Injectable,
  HttpModuleOptionsFactory,
  HttpModuleOptions,
} from '@nestjs/common';
import { InjectConfig, ConfigService } from 'nestjs-config';
import * as https from 'https';
import * as HttpsProxyAgent from 'https-proxy-agent';
import * as fs from 'fs';
export interface HeadersOptions {
  userId: string;
  clientSiret: string;
}

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  public constructor(@InjectConfig() private readonly config: ConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    const headers: HeadersOptions = {
      userId: this.config.get('rnipp').userId,
      clientSiret: this.config.get('rnipp').clientSiret,
    };
    const httpAgentConfig = this.config.get('rnipp').httpsAgentConfig;

    if (httpAgentConfig.key || httpAgentConfig.cert) {
      if (httpAgentConfig.ca) {
        httpAgentConfig.ca = fs.readFileSync(httpAgentConfig.ca);
      }

      httpAgentConfig.key = fs.readFileSync(httpAgentConfig.key);
      httpAgentConfig.cert = fs.readFileSync(httpAgentConfig.cert);
    }

    let httpsAgent;

    const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;

    if (httpsProxy) {
      httpsAgent = new HttpsProxyAgent(httpsProxy);
      httpsAgent.options = httpAgentConfig;
    } else {
      httpsAgent = new https.Agent(httpAgentConfig);
    }

    return {
      headers,
      httpsAgent,
      proxy: false,
    };
  }
}
