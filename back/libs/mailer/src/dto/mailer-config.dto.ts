/* istanbul ignore file */

// Declarative code
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsString,
  IsUrl,
  NotContains,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

type MailerType = 'logs' | 'smtp';

export class MailFrom {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly name: string;
}

export class MailTo {
  @IsEmail()
  @NotContains('localhost')
  readonly email: string;

  @IsString()
  readonly name: string;
}
class SmtpOptions {
  @IsString()
  readonly proxyUrl: string;

  @IsUrl()
  readonly host: string;

  @IsNumber()
  readonly port: number;

  @IsBoolean()
  readonly ignoreTLS: boolean;

  @IsBoolean()
  readonly secure: boolean;
}

export class MailerConfig {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly templatePaths: string[];

  @IsString()
  readonly transport: MailerType;

  @ValidateNested()
  @Type(() => SmtpOptions)
  @ValidateIf(({ transport }) => transport === 'smtp')
  readonly options: SmtpOptions;

  @IsObject()
  @ValidateNested()
  @Type(() => MailFrom)
  readonly from: MailFrom;
}
