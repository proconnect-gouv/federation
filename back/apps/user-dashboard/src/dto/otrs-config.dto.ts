import { IsEmail, IsString } from 'class-validator';

export class OtrsConfig {
  @IsEmail()
  readonly otrsEmail: string;

  @IsString()
  readonly recipientName: string;

  @IsString()
  readonly fraudEmailSubject: string;
}
