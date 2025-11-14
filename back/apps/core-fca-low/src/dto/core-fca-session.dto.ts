import { Expose, Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';

import { UserSession } from '@fc/core/dto/user-session/user-session.dto';
import { CsrfSession } from '@fc/csrf';
import { FlowStepsSession } from '@fc/flow-steps/dto/flow-steps-session.dto';

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
  @Type(() => FlowStepsSession)
  @Expose()
  readonly FlowSteps: FlowStepsSession;
}
