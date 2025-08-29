import { IsDefined } from 'class-validator';

export class GetIdentityProviderSelectionSessionDto {
  @IsDefined()
  readonly login_hint: string;
}
