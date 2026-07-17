import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { TransportType } from "../enums/transport-type.enum";

export class MailerConfig {
  @IsEnum(TransportType)
  @IsOptional()
  readonly transport?: TransportType;

  @IsString()
  readonly fromEmail: string;

  @IsString()
  readonly fromName: string;

  @IsString()
  @ValidateIf(({ transport }) => transport === TransportType.SMTP)
  readonly smtpUrl?: string;

  @IsString()
  @ValidateIf(({ transport }) => transport === TransportType.BREVO)
  readonly brevoApiKey?: string;
}
