import { Expose, Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { CoreBaseSessionDto } from '@fc/core';
import { OidcClientRoutes } from '@fc/oidc-client';

import { CoreFcaRoutes } from '../enums/core-fca-routes.enum';

export class GetOidcCallbackSessionDto extends CoreBaseSessionDto {
  // Metadata: We MUST restrict the routes we can come from
  @IsString()
  @IsIn([
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION,
    OidcClientRoutes.REDIRECT_TO_IDP,
  ])
  @Expose()
  readonly stepRoute: string;

  // Identity Provider: We MUST have idpId
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpId: string;

  // Identity Provider: We MUST have idpName
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpName: string;

  // Identity Provider: We MUST have idpLabel
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpLabel: string;

  // Identity Provider: We MUST have idpState
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpState: string;

  // Identity Provider: We MUST have idpNonce
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly idpNonce: string;
}

export class GetOidcCallbackCoreSessionDto {
  @Expose()
  @Type(() => GetOidcCallbackSessionDto)
  readonly OidcClient: GetOidcCallbackSessionDto;
}
