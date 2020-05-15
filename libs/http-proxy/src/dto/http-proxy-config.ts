import { IsUrl } from 'class-validator';

export class HttpProxyConfig {
  // library defined parameter name
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsUrl({ require_tld: false })
  readonly httpsProxy: string;
}
