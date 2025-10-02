import { IsDefined } from 'class-validator';

export class GetIdentityProviderSelectionSessionDto {
  @IsDefined()
  readonly idpLoginHint: string;
}
