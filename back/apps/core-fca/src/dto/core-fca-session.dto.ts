import { Expose, Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';

import { CsrfSession } from '@fc/csrf';
import { FlowStepsSession } from '@fc/flow-steps/dto/flow-steps-session.dto';
import { I18nSession } from '@fc/i18n';

import { UserSession } from './user-session.dto';

export class CoreFcaSession {
  @IsObject()
  @ValidateNested()
  @Type(() => UserSession)
  @Expose()
  readonly User: UserSession;

  @IsObject()
  @ValidateNested()
  @Type(() => CsrfSession)
  @IsOptional()
  @Expose()
  readonly Csrf?: CsrfSession;

  @IsObject()
  @ValidateNested()
  @Type(() => I18nSession)
  @Expose()
  readonly I18n: I18nSession;

  @IsObject()
  @ValidateNested()
  @Type(() => FlowStepsSession)
  @Expose()
  readonly FlowSteps: FlowStepsSession;
}
