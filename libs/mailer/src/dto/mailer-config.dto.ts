import { IsString, ValidateNested, IsObject, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

type MailerType = 'logs' | 'mailjet';

export class MailFrom {
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsString()
  readonly name: string;
}

class MailjetOptions {
  @IsString()
  readonly proxyUrl: string;
}

export class MailerConfig {
  @IsString()
  readonly transport: MailerType;

  @IsString()
  readonly key: string;

  @IsString()
  readonly secret: string;

  @ValidateNested()
  @Type(/* istanbul ignore next */ () => MailjetOptions)
  readonly options: MailjetOptions;

  @IsObject()
  @ValidateNested()
  @Type(/* istanbul ignore next */ () => MailFrom)
  readonly from: MailFrom;
}
