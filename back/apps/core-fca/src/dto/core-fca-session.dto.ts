import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';

import { CsrfSession } from '@fc/csrf';
import { I18nSession } from '@fc/i18n';
import { Session } from '@fc/session';

export class CoreFcaSession {
  @IsObject()
  @ValidateNested()
  @Type(() => Session)
  readonly OidcClient: Session;

  @IsObject()
  @ValidateNested()
  @Type(() => CsrfSession)
  @IsOptional()
  readonly Csrf?: CsrfSession;

  @IsObject()
  @ValidateNested()
  @Type(() => I18nSession)
  readonly I18n: I18nSession;
}
