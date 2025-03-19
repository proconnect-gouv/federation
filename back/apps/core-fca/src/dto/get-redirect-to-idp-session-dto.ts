import { Expose } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

import { CoreBaseSessionDto, CoreRoutes } from '@fc/core';
import { OidcClientRoutes } from '@fc/oidc-client';

import { CoreFcaRoutes } from '../enums/core-fca-routes.enum';

export class GetRedirectToIdpSessionDto extends CoreBaseSessionDto {
  // Metadata: We MUST restrict the routes we can come from
  @IsString()
  @IsIn([
    CoreRoutes.INTERACTION,
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION,
  ])
  @Expose()
  readonly stepRoute: string;
}

export class GetIdentityProviderSelectionSessionDto extends CoreBaseSessionDto {
  // Metadata: We MUST restrict the routes we can come from
  @IsString()
  @IsIn([CoreRoutes.INTERACTION, OidcClientRoutes.REDIRECT_TO_IDP])
  @Expose()
  readonly stepRoute: string;

  @IsString()
  readonly login_hint: string;
}
