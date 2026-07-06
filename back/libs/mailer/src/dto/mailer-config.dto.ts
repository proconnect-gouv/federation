import { IsEnum, IsOptional, IsString } from "class-validator";
import { TransportType } from "../enums/transport-type.enum";

export class MailerConfig {
  @IsEnum(TransportType)
  @IsOptional()
  readonly transport?: TransportType;

  @IsString()
  readonly fromEmail!: string;

  @IsString()
  readonly fromName!: string;

  @IsString()
  @IsOptional()
  readonly smtpUrl?: string;

  @IsString()
  @IsOptional()
  readonly brevoApiKey?: string;
}
