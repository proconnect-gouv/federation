import { Expose } from 'class-transformer';
import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';

import { PartialExcept } from '@fc/common';
import { CoreBaseSessionDto } from '@fc/core';
import { OidcClientRoutes } from '@fc/oidc-client';
import { OidcProviderRoutes } from '@fc/oidc-provider';

import { IAgentIdentityWithPublicness } from '../interfaces';

export class GetVerifySessionDto extends CoreBaseSessionDto {
  // Metadata: We MUST restrict the routes we can come from
  @IsString()
  @IsIn([OidcClientRoutes.OIDC_CALLBACK, OidcProviderRoutes.AUTHORIZATION])
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

  // Identity : We MUST have idpIdentity
  @IsObject()
  @Expose()
  readonly idpIdentity:
    | PartialExcept<IAgentIdentityWithPublicness, 'sub'>
    | IAgentIdentityWithPublicness;
}
