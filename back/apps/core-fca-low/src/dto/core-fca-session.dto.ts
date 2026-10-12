import { CsrfSession } from "#libs/csrf";
import { UserSession } from "#src/dto/user-session/user-session.dto";
import { Expose, Type } from "class-transformer";
import { IsObject, IsOptional, ValidateNested } from "class-validator";

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
}
