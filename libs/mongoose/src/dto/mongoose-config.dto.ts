import { IsNotEmpty, IsString } from 'class-validator';

export class MongooseConfig {
  @IsString()
  @IsNotEmpty()
  readonly user: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly hosts: string;

  @IsString()
  @IsNotEmpty()
  readonly database: string;

  @IsString()
  readonly options: string;
}
