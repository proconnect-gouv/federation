import { Expose } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { PartialExcept } from '@fc/common';
import { CoreBaseSessionDto, CoreRoutes } from '@fc/core';
import { IOidcIdentity } from '@fc/oidc';
import { OidcClientRoutes } from '@fc/oidc-client';
import { OidcProviderRoutes } from '@fc/oidc-provider';

import { CoreFcaRoutes } from '../enums/core-fca-routes.enum';

export class GetInteractionSessionDto extends CoreBaseSessionDto {
  // Metadata: We MAY have an accountId (SSO)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose()
  readonly accountId?: string;

  // Metadata: We MUST restrict the routes we can come from
  // routes are listed in chronological order of the cinematic
  @IsString()
  @IsIn([
    OidcProviderRoutes.AUTHORIZATION, // Standard cinematic
    CoreRoutes.INTERACTION, // Refresh
    OidcClientRoutes.OIDC_CALLBACK, // Back on error
    CoreRoutes.INTERACTION_VERIFY, // Back on error
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION, // Client is choosing an identity provider
    OidcClientRoutes.REDIRECT_TO_IDP, // Browser back button
  ])
  @Expose()
  readonly stepRoute: string;

  // Identity: We MAY have an idpIdentity (SSO)
  @IsOptional()
  @IsObject()
  @Expose()
  readonly idpIdentity?: PartialExcept<IOidcIdentity, 'sub'> | IOidcIdentity;
}
