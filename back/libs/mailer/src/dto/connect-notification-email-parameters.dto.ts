import { IsString } from 'class-validator';

export class ConnectNotificationEmailParameters {
  @IsString()
  readonly familyName: string;

  @IsString()
  readonly givenName: string;

  @IsString()
  readonly idpName: string;

  @IsString()
  readonly spName: string;

  @IsString()
  readonly today: string;
}
