/* istanbul ignore file */

// Declarative code
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { UserDashboardFrontRoutes } from '../enums';

export class redirectToIdpQueryDto {
  @IsString()
  @IsEnum(UserDashboardFrontRoutes)
  @IsOptional()
  redirectUrl?: string;
}
