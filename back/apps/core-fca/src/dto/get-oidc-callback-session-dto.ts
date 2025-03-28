import { IsDefined } from 'class-validator';

export class GetOidcCallbackSessionDto {
  @IsDefined()
  readonly idpId: string;

  @IsDefined()
  readonly idpName: string;

  @IsDefined()
  readonly idpLabel: string;

  @IsDefined()
  readonly idpState: string;

  @IsDefined()
  readonly idpNonce: string;
}
