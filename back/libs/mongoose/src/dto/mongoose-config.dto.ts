/* istanbul ignore file */

// Declarative code
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MongooseConfigOptions {
  @IsString()
  @IsOptional()
  readonly replicatSet?: string;

  @IsString()
  readonly authSource: string;

  @IsBoolean()
  readonly tls: boolean;

  @IsBoolean()
  readonly tlsInsecure: boolean;

  @IsString()
  @IsOptional()
  readonly tlsCAFile?: string;

  @IsBoolean()
  @IsOptional()
  readonly tlsAllowInvalidHostnames?: boolean;

  @IsBoolean()
  readonly useNewUrlParser: boolean;

  @IsBoolean()
  readonly useUnifiedTopology: boolean;
}

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

  @IsObject()
  @ValidateNested()
  @Type(() => MongooseConfigOptions)
  readonly options: MongooseConfigOptions;
}
